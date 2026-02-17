import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to specific roles.
 * Must be used after authMiddleware.
 */
export function requireRole(...roles: ('owner' | 'admin')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'ไม่ได้รับอนุญาต' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
      });
    }

    next();
  };
}

// Shorthand for owner-only routes
export const ownerOnly = requireRole('owner');
