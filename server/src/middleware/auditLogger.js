const { getIsMock } = require('../config/db');
const AuditLog = require('../models/AuditLog');
const mockDb = require('../utils/mockStore');

const logAudit = async ({ req, action, entityType, entityId, metadata = {} }) => {
  try {
    const logData = {
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Unauthenticated User',
      userRole: req.user ? req.user.role : 'guest',
      action,
      entityType,
      entityId: String(entityId || ''),
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      metadata,
      createdAt: new Date(),
    };

    if (getIsMock()) {
      mockDb.create('auditLogs', logData);
    } else {
      await AuditLog.create(logData);
    }
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

module.exports = {
  logAudit,
};
