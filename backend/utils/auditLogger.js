import AuditLog from '../models/AuditLog.js';

class AuditLogger {
  /**
   * Log a system action
   * @param {Object} params - Audit log parameters
   * @param {string} params.userId - User ID performing the action
   * @param {string} params.firmId - Firm ID (optional)
   * @param {string} params.action - Action type
   * @param {string} params.category - Category (system, security, data, user, settings, other)
   * @param {string} params.severity - Severity level (low, medium, high, critical)
   * @param {string} params.description - Human-readable description
   * @param {Object} params.details - Additional details
   * @param {string} params.ipAddress - User's IP address
   * @param {string} params.userAgent - User's user agent
   * @param {string} params.status - Status (success, failure, pending)
   * @param {string} params.errorMessage - Error message if status is failure
   */
  async log({
    userId,
    firmId,
    action,
    category = 'other',
    severity = 'medium',
    description,
    details = {},
    ipAddress,
    userAgent,
    status = 'success',
    errorMessage
  }) {
    try {
      const auditLog = new AuditLog({
        user: userId,
        firm: firmId || null,
        action,
        category,
        severity,
        description,
        details,
        ipAddress,
        userAgent,
        status,
        errorMessage
      });

      await auditLog.save();
      
      // Log critical actions to console as well
      if (severity === 'critical' || severity === 'high') {
        console.log(`[AUDIT] ${severity.toUpperCase()}: ${action} by user ${userId} - ${description}`);
      }

      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging failure shouldn't break the application
      return null;
    }
  }

  /**
   * Log system restart
   */
  async logSystemRestart(userId, firmId, ipAddress, userAgent, totpVerified = false) {
    return this.log({
      userId,
      firmId,
      action: 'system_restart',
      category: 'system',
      severity: 'critical',
      description: `System restart initiated by user${totpVerified ? ' (TOTP verified)' : ' (TOTP bypassed)'}`,
      details: { totpVerified },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log full system restart
   */
  async logFullSystemRestart(userId, firmId, ipAddress, userAgent, totpVerified = false) {
    return this.log({
      userId,
      firmId,
      action: 'full_system_restart',
      category: 'system',
      severity: 'critical',
      description: `Full system restart initiated by user${totpVerified ? ' (TOTP verified)' : ' (TOTP bypassed)'}`,
      details: { totpVerified },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log system shutdown
   */
  async logSystemShutdown(userId, firmId, ipAddress, userAgent, totpVerified = false) {
    return this.log({
      userId,
      firmId,
      action: 'system_shutdown',
      category: 'system',
      severity: 'critical',
      description: `System shutdown initiated by user${totpVerified ? ' (TOTP verified)' : ' (TOTP bypassed)'}`,
      details: { totpVerified },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log settings reset
   */
  async logSettingsReset(userId, firmId, ipAddress, userAgent, category = null) {
    return this.log({
      userId,
      firmId,
      action: 'settings_reset',
      category: 'settings',
      severity: 'high',
      description: category ? `Settings category '${category}' reset to defaults` : 'All settings reset to defaults',
      details: { category },
      ipAddress,
      userAgent
    });
  }

  /**
   * Get recent audit logs
   */
  async getRecentLogs(firmId, limit = 100) {
    try {
      const logs = await AuditLog.find({ firm: firmId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'fullName email username')
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  /**
   * Get critical logs (high and critical severity)
   */
  async getCriticalLogs(firmId, limit = 50) {
    try {
      const logs = await AuditLog.find({ 
        firm: firmId,
        severity: { $in: ['high', 'critical'] }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'fullName email username')
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Failed to fetch critical audit logs:', error);
      return [];
    }
  }
}

export default new AuditLogger();
