import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { eq, ne } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { ownerOnly } from '../middleware/roleGuard';

const router = Router();

// All user routes require auth + owner role
router.use(authMiddleware, ownerOnly);

// GET /api/users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return res.json({ users: allUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/users/invite - Create a new user
router.post('/invite', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, role } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    // Check if username exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        fullName: fullName || null,
        role: role || 'admin',
      })
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
      });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Invite user error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PATCH /api/users/:id/role - Change user role
router.patch('/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserId = req.user!.userId;

    // Cannot modify own role
    if (id === currentUserId) {
      return res
        .status(400)
        .json({ error: 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้' });
    }

    if (!['owner', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
    }

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
      });

    if (!updated) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    return res.json({ user: updated });
  } catch (error) {
    console.error('Change role error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

export default router;
