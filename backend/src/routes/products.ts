import { Router, Request, Response } from 'express';
import { eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { products } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/products?search=xxx
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let query = db.select().from(products);

    if (search && typeof search === 'string') {
      query = query.where(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )
      ) as typeof query;
    }

    const result = await query.orderBy(products.createdAt);
    return res.json({ products: result });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, sku, price, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อสินค้าและราคา' });
    }

    const [newProduct] = await db
      .insert(products)
      .values({ name, sku, price: String(price), stock: Number(stock) || 0 })
      .returning();

    return res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PATCH /api/products/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = String(price);
    if (stock !== undefined) updateData.stock = Number(stock);

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    return res.json({ product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    return res.json({ message: 'ลบสินค้าเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

export default router;
