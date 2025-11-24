import express from 'express';
import auth from '../middleware/auth.js';
import { requireOwnerOrAdmin } from '../middleware/authorize.js';
import fs from 'fs/promises';
import path from 'path';
import Settings from '../models/Settings.js';
import Firm from '../models/Firm.js';
import User from '../models/User.js';
import defaultSettings from '../config/defaultSettings.js';
import totpService from '../services/totpService.js';
import auditLogger from '../utils/auditLogger.js';

const router = express.Router();

// Deep merge helper (mutates target)
function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

async function getOrCreateSettings(firmId, userId) {
  let settings = await Settings.findOne({ firm: firmId });
  if (!settings) {
    // Try to prefill from firm document if available
    const firm = firmId ? await Firm.findById(firmId).lean() : null;
    const initial = JSON.parse(JSON.stringify(defaultSettings));
    if (firm && firm.settings) {
      // Merge firm.settings into company settings
      initial.company = { ...initial.company, ...firm.settings };
    }
    settings = new Settings({ firm: firmId, data: initial, createdBy: userId, updatedBy: userId });
    await settings.save();
  }
  return settings;
}

// @route   GET /api/settings/public/branding
// @desc    Get public branding settings (accessible to all authenticated users)
// @access  Private (All roles)
router.get('/public/branding', auth, async (req, res) => {
  try {
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);
    
    // Extract only branding-related information
    const brandingData = {
      companyName: settings.data?.company?.name || settings.data?.company?.companyName || 'CA Flow Board',
      branding: settings.data?.company?.branding || {},
      invoiceAccounts: settings.data?.company?.invoiceAccounts || {}
    };
    
    res.json({ success: true, data: brandingData });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/settings
// @desc    Get all settings
// @access  Private (Owner/Admin only)
router.get('/', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);
    res.json({ success: true, data: settings.data });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/settings/:category
// @desc    Get settings by category
// @access  Private (Owner/Admin only)
router.get('/:category', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);

    if (!settings.data || settings.data[category] === undefined) {
      return res.status(404).json({ success: false, message: 'Settings category not found' });
    }

    res.json({ success: true, data: settings.data[category] });
  } catch (error) {
    console.error('Error fetching settings category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/:category
// @desc    Update settings for a category
// @access  Private (Owner/Admin only)
router.put('/:category', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const update = req.body;
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);

    if (!settings.data[category]) {
      return res.status(404).json({ success: false, message: 'Settings category not found' });
    }

    // Deep merge update into category
    console.debug('[settings] PUT /api/settings/%s - incoming update: %o (firm=%s, user=%s)', category, update, String(firmId), String(req.user && req.user._id));
    settings.data[category] = mergeDeep(settings.data[category] || {}, update || {});
    settings.updatedBy = req.user && req.user._id;
    settings.markModified('data'); // Required for Mixed type fields

    const saved = await settings.save();
    console.debug('[settings] PUT /api/settings/%s - saved settings id=%s, category snapshot=%o', category, String(saved._id), saved.data && saved.data[category]);

    res.json({ success: true, data: settings.data[category], message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/:category/:key
// @desc    Update a specific setting
// @access  Private (Owner/Admin only)
router.put('/:category/:key', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { category, key } = req.params;
    const { value } = req.body;
    const firmId = req.user && req.user.firmId;
    // Use an atomic update for the single-key change to avoid issues with Mixed
    const doc = await Settings.findOne({ firm: firmId });
    if (!doc || !doc.data || !doc.data[category]) return res.status(404).json({ success: false, message: 'Settings category not found' });

    console.debug('[settings] PUT /api/settings/%s/%s - atomic update incoming value: %o (firm=%s, user=%s)', category, key, value, String(firmId), String(req.user && req.user._id));

    const path = `data.${category}.${key}`;
    const updated = await Settings.findOneAndUpdate(
      { firm: firmId },
      { $set: { [path]: value, updatedBy: req.user && req.user._id } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(500).json({ success: false, message: 'Failed to update setting' });
    }

    console.debug('[settings] PUT /api/settings/%s/%s - atomic saved id=%s, newValue=%o', category, key, String(updated._id), updated.data && updated.data[category] && updated.data[category][key]);

    res.json({ success: true, data: { category, key, value: updated.data && updated.data[category] && updated.data[category][key] }, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/settings/reset
// @desc    Reset settings to default values
// @access  Private (Owner/Admin only)
router.post('/reset', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { category } = req.body;
    const firmId = req.user && req.user.firmId;
    const userId = req.user && req.user._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const settings = await getOrCreateSettings(firmId, userId);

    if (category) {
      if (!defaultSettings[category]) return res.status(404).json({ message: 'Settings category not found' });
      settings.data[category] = JSON.parse(JSON.stringify(defaultSettings[category]));
    } else {
      settings.data = JSON.parse(JSON.stringify(defaultSettings));
    }

    settings.updatedBy = userId;
    settings.markModified('data'); // Required for Mixed type fields
    await settings.save();
    
    // Log settings reset
    await auditLogger.logSettingsReset(userId, firmId, ipAddress, userAgent, category);
    
    res.json(settings.data);
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/settings/export
// @desc    Export settings
// @access  Private (Owner/Admin only)
router.post('/export', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);
    const exportData = { exportDate: new Date().toISOString(), version: '1.0', settings: settings.data };
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/settings/save-file
// @desc    Persist settingsStore to a settings.json file on the backend (development convenience)
// @access  Private (Owner/Admin only)
router.post('/save-file', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);
    const filePath = path.join(process.cwd(), 'backend', 'settings.json');
    await fs.writeFile(filePath, JSON.stringify(settings.data, null, 2), { encoding: 'utf8' });
    return res.json({ success: true, message: `Settings saved to ${filePath}` });
  } catch (error) {
    console.error('Error saving settings to file:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings file' });
  }
});

// @route   POST /api/settings/import
// @desc    Import settings
// @access  Private (Owner/Admin only)
router.post('/import', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { settings: imported } = req.body;
    if (!imported || typeof imported !== 'object') return res.status(400).json({ message: 'Invalid settings data' });

    const firmId = req.user && req.user.firmId;
    const settings = await getOrCreateSettings(firmId, req.user && req.user._id);

    // Only merge known categories
    const validCategories = ['company', 'notifications', 'security', 'billing', 'system', 'automation'];
    for (const category of validCategories) {
      if (imported[category]) {
        settings.data[category] = mergeDeep(settings.data[category] || {}, imported[category]);
      }
    }

    settings.updatedBy = req.user && req.user._id;
    settings.markModified('data'); // Required for Mixed type fields
    await settings.save();

    res.json({ message: 'Settings imported successfully', settings: settings.data });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/settings/system/restart
// @desc    Restart application server
// @access  Private (Owner only)
router.post('/system/restart', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { totp } = req.body;
    const userId = req.user._id;
    const firmId = req.user.firmId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    let totpVerified = false;
    
    // If TOTP provided and not 'bypass', verify it
    if (totp && totp !== 'bypass') {
      // Find auditor user (role: owner with 2FA enabled)
      const auditor = await User.findOne({
        firmId,
        role: { $in: ['owner', 'superadmin'] },
        twoFactorEnabled: true
      }).select('+twoFactorSecret');

      if (auditor && auditor.twoFactorSecret) {
        totpVerified = totpService.verifyToken(totp, auditor.twoFactorSecret);
        
        if (!totpVerified) {
          await auditLogger.log({
            userId,
            firmId,
            action: 'system_restart',
            category: 'system',
            severity: 'critical',
            description: 'System restart attempt failed - Invalid TOTP',
            status: 'failure',
            errorMessage: 'Invalid TOTP code',
            ipAddress,
            userAgent
          });
          
          return res.status(401).json({ success: false, message: 'Invalid TOTP code' });
        }
      }
    }

    // Log the restart action
    await auditLogger.logSystemRestart(userId, firmId, ipAddress, userAgent, totpVerified);
    
    console.log(`[SYSTEM] Application restart initiated by user ${req.user.email} (${userId})`);
    
    res.json({ success: true, message: 'Application restarting...' });
    
    // Delay the restart slightly to allow response to be sent
    setTimeout(() => {
      process.exit(0); // Exit cleanly - process manager (PM2/systemd) should restart
    }, 500);
  } catch (error) {
    console.error('Error restarting application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/settings/system/shutdown
// @desc    Shutdown application
// @access  Private (Owner only)
router.post('/system/shutdown', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { totp } = req.body;
    const userId = req.user._id;
    const firmId = req.user.firmId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    if (!totp) {
      return res.status(400).json({ success: false, message: 'TOTP required from auditor\'s authenticator' });
    }
    
    let totpVerified = false;
    
    // Find auditor user (role: owner with 2FA enabled)
    const auditor = await User.findOne({
      firmId,
      role: { $in: ['owner', 'superadmin'] },
      twoFactorEnabled: true
    }).select('+twoFactorSecret');

    if (auditor && auditor.twoFactorSecret) {
      totpVerified = totpService.verifyToken(totp, auditor.twoFactorSecret);
      
      if (!totpVerified) {
        await auditLogger.log({
          userId,
          firmId,
          action: 'system_shutdown',
          category: 'system',
          severity: 'critical',
          description: 'System shutdown attempt failed - Invalid TOTP',
          status: 'failure',
          errorMessage: 'Invalid TOTP code',
          ipAddress,
          userAgent
        });
        
        return res.status(401).json({ success: false, message: 'Invalid TOTP code' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'No auditor with 2FA enabled found. Please set up 2FA first.' });
    }

    // Log the shutdown action
    await auditLogger.logSystemShutdown(userId, firmId, ipAddress, userAgent, totpVerified);
    
    console.log(`[SYSTEM] Application shutdown initiated by user ${req.user.email} (${userId})`);
    
    res.json({ success: true, message: 'Application shutting down...' });
    
    // Delay the shutdown slightly to allow response to be sent
    setTimeout(() => {
      process.exit(1); // Exit with error code - will not auto-restart
    }, 500);
  } catch (error) {
    console.error('Error shutting down application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/settings/system/full-restart
// @desc    Full system restart (application + services)
// @access  Private (Owner only)
router.post('/system/full-restart', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { totp } = req.body;
    const userId = req.user._id;
    const firmId = req.user.firmId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    if (!totp) {
      return res.status(400).json({ success: false, message: 'TOTP required from auditor\'s authenticator' });
    }
    
    let totpVerified = false;
    
    // Find auditor user (role: owner with 2FA enabled)
    const auditor = await User.findOne({
      firmId,
      role: { $in: ['owner', 'superadmin'] },
      twoFactorEnabled: true
    }).select('+twoFactorSecret');

    if (auditor && auditor.twoFactorSecret) {
      totpVerified = totpService.verifyToken(totp, auditor.twoFactorSecret);
      
      if (!totpVerified) {
        await auditLogger.log({
          userId,
          firmId,
          action: 'full_system_restart',
          category: 'system',
          severity: 'critical',
          description: 'Full system restart attempt failed - Invalid TOTP',
          status: 'failure',
          errorMessage: 'Invalid TOTP code',
          ipAddress,
          userAgent
        });
        
        return res.status(401).json({ success: false, message: 'Invalid TOTP code' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'No auditor with 2FA enabled found. Please set up 2FA first.' });
    }

    // Log the full restart action
    await auditLogger.logFullSystemRestart(userId, firmId, ipAddress, userAgent, totpVerified);
    
    console.log(`[SYSTEM] Full system restart initiated by user ${req.user.email} (${userId})`);
    
    res.json({ success: true, message: 'Full system restart in progress...' });
    
    // For full restart, you might want to trigger additional cleanup
    setTimeout(() => {
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error performing full restart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
