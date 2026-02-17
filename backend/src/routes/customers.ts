import { Router, Request, Response } from 'express';
import { eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { customers } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/customers?search=xxx
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let query = db.select().from(customers);

    if (search && typeof search === 'string') {
      query = query.where(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.phone, `%${search}%`),
          ilike(customers.email, `%${search}%`)
        )
      ) as typeof query;
    }

    const result = await query.orderBy(customers.createdAt);
    return res.json({ customers: result });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/customers
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อลูกค้า' });
    }

    const [newCustomer] = await db
      .insert(customers)
      .values({ name, phone, email })
      .returning();

    return res.status(201).json({ customer: newCustomer });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PATCH /api/customers/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const [updated] = await db
      .update(customers)
      .set({ name, phone, email })
      .where(eq(customers.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'ไม่พบลูกค้า' });
    }

    return res.json({ customer: updated });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบลูกค้า' });
    }

    return res.json({ message: 'ลบลูกค้าเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

export default router;
