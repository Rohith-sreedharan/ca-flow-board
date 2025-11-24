import express from 'express';
import auth from '../middleware/auth.js';
import { requireOwnerOrAdmin } from '../middleware/authorize.js';
import AuditLog from '../models/AuditLog.js';
import auditLogger from '../utils/auditLogger.js';

const router = express.Router();

// @route   GET /api/audit-logs
// @desc    Get audit logs with pagination and filters
// @access  Private (Owner/Admin only)
router.get('/', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user.firmId;
    const {
      page = 1,
      limit = 50,
      category,
      severity,
      action,
      startDate,
      endDate,
      userId
    } = req.query;

    const query = { firm: firmId };

    // Apply filters
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (action) query.action = action;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'fullName email username')
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/audit-logs/critical
// @desc    Get critical audit logs (high and critical severity)
// @access  Private (Owner/Admin only)
router.get('/critical', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user.firmId;
    const limit = parseInt(req.query.limit) || 50;
    
    const logs = await auditLogger.getCriticalLogs(firmId, limit);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching critical audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/audit-logs/stats
// @desc    Get audit log statistics
// @access  Private (Owner/Admin only)
router.get('/stats', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user.firmId;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const [
      totalLogs,
      criticalLogs,
      failedActions,
      byCategory,
      bySeverity
    ] = await Promise.all([
      AuditLog.countDocuments({ firm: firmId, createdAt: { $gte: startDate } }),
      AuditLog.countDocuments({ firm: firmId, severity: 'critical', createdAt: { $gte: startDate } }),
      AuditLog.countDocuments({ firm: firmId, status: 'failure', createdAt: { $gte: startDate } }),
      AuditLog.aggregate([
        { $match: { firm: firmId, createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { firm: firmId, createdAt: { $gte: startDate } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        totalLogs,
        criticalLogs,
        failedActions,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/audit-logs/:id
// @desc    Get single audit log by ID
// @access  Private (Owner/Admin only)
router.get('/:id', auth, requireOwnerOrAdmin, async (req, res) => {
  try {
    const firmId = req.user.firmId;
    const log = await AuditLog.findOne({ _id: req.params.id, firm: firmId })
      .populate('user', 'fullName email username role')
      .lean();
    
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
