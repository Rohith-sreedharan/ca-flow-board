import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'system_restart',
      'system_shutdown',
      'full_system_restart',
      'server_shutdown',
      'settings_reset',
      'settings_export',
      'settings_import',
      'user_created',
      'user_deleted',
      'user_role_changed',
      'data_export',
      'data_import',
      'backup_created',
      'backup_restored',
      'security_settings_changed',
      'other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['system', 'security', 'data', 'user', 'settings', 'other'],
    default: 'other'
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ firm: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, severity: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
