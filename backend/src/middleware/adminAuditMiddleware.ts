import { Response, NextFunction } from 'express';
import { AdminAuthRequest } from './adminAuth';
import AdminAudit from '../models/AdminAudit';
import logger from '../utils/logger';

export const logAdminAction = (actionName: string, resourceType: string, extractResourceId?: (req: AdminAuthRequest) => string) => {
  return async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    // Intercept response to only log successful or specifically failed actions
    const originalSend = res.send;
    let responseSent = false;
    
    res.send = function (body) {
      if (!responseSent) {
        responseSent = true;
        
        // Log the audit event asynchronously after response is sent
        if (req.admin && res.statusCode >= 200 && res.statusCode < 400) {
          const resourceId = extractResourceId ? extractResourceId(req) : req.params.id;
          
          AdminAudit.create({
            adminId: req.admin._id,
            action: actionName,
            resourceType,
            resourceId,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
              query: req.query,
              statusCode: res.statusCode,
            },
            ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown',
          }).catch(err => {
            logger.error('Failed to create AdminAudit record', err);
          });
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
