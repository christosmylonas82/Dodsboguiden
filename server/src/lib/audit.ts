import { prisma } from './prisma.js';

export function logAudit(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
}) {
  return prisma.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
    },
  });
}
