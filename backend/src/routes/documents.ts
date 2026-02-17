import { Router, Request, Response } from 'express';
import { eq, and, ilike, or, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { documents, customers } from '../db/schema';
import type { DocumentItem } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Helper: generate document number
async function generateDocNumber(
  type: 'quotation' | 'voi' | 'receipt'
): Promise<string> {
  const prefix =
    type === 'quotation' ? 'QT' : type === 'voi' ? 'VD' : 'RC';
  const year = new Date().getFullYear();

  // Count existing docs of this type this year
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(
      and(
        eq(documents.docType, type),
        sql`extract(year from ${documents.createdAt}) = ${year}`
      )
    );

  const count = Number(result[0]?.count || 0) + 1;
  return `${prefix}-${year}-${String(count).padStart(3, '0')}`;
}

// GET /api/documents?type=quotation|voi|receipt&status=draft|confirmed&search=xxx
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, search } = req.query;

    const conditions = [];

    if (type && ['quotation', 'voi', 'receipt'].includes(type as string)) {
      conditions.push(
        eq(documents.docType, type as 'quotation' | 'voi' | 'receipt')
      );
    }

    if (
      status &&
      ['draft', 'confirmed', 'converted', 'cancelled'].includes(status as string)
    ) {
      conditions.push(
        eq(
          documents.status,
          status as 'draft' | 'confirmed' | 'converted' | 'cancelled'
        )
      );
    }

    if (search && typeof search === 'string') {
      conditions.push(
        or(
          ilike(documents.docNumber, `%${search}%`),
          ilike(documents.customerName, `%${search}%`)
        )
      );
    }

    const query = db
      .select()
      .from(documents)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(documents.createdAt));

    const result = await query;
    return res.json({ documents: result });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// GET /api/documents/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!doc) {
      return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    }

    return res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/documents
router.post('/', async (req: Request, res: Response) => {
  try {
    const { docType, customerId, customerName, items, notes, status } =
      req.body;

    if (!docType || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: 'กรุณาระบุประเภทเอกสารและรายการสินค้า' });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: DocumentItem) => sum + item.total,
      0
    );
    const tax = Math.round(subtotal * 0.07 * 100) / 100;
    const total = subtotal + tax;

    // Resolve customer name if not provided
    let resolvedCustomerName = customerName;
    if (customerId && !customerName) {
      const [cust] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);
      resolvedCustomerName = cust?.name || '';
    }

    const docNumber = await generateDocNumber(docType);

    const [newDoc] = await db
      .insert(documents)
      .values({
        docNumber,
        docType,
        customerId: customerId || null,
        customerName: resolvedCustomerName || null,
        items,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: status || 'draft',
        notes: notes || null,
        createdBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json({ document: newDoc });
  } catch (error) {
    console.error('Create document error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PATCH /api/documents/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerId, customerName, items, notes, status } = req.body;

    const updateData: Record<string, unknown> = {};

    if (items && Array.isArray(items)) {
      const subtotal = items.reduce(
        (sum: number, item: DocumentItem) => sum + item.total,
        0
      );
      const tax = Math.round(subtotal * 0.07 * 100) / 100;
      const total = subtotal + tax;
      updateData.items = items;
      updateData.subtotal = subtotal.toFixed(2);
      updateData.tax = tax.toFixed(2);
      updateData.total = total.toFixed(2);
    }

    if (customerId !== undefined) updateData.customerId = customerId;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    }

    return res.json({ document: updated });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    }

    return res.json({ message: 'ลบเอกสารเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/documents/:id/convert - Convert quotation to receipt
router.post('/:id/convert', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get original document
    const [original] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!original) {
      return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    }

    if (original.docType !== 'quotation') {
      return res
        .status(400)
        .json({ error: 'สามารถแปลงได้เฉพาะใบเสนอราคาเท่านั้น' });
    }

    if (original.status === 'converted') {
      return res.status(400).json({ error: 'เอกสารนี้ถูกแปลงแล้ว' });
    }

    // Generate receipt number
    const docNumber = await generateDocNumber('receipt');

    // Create new receipt
    const [newReceipt] = await db
      .insert(documents)
      .values({
        docNumber,
        docType: 'receipt',
        customerId: original.customerId,
        customerName: original.customerName,
        items: original.items,
        subtotal: original.subtotal,
        tax: original.tax,
        total: original.total,
        status: 'confirmed',
        notes: original.notes,
        convertedFrom: original.id,
        createdBy: req.user!.userId,
      })
      .returning();

    // Mark original as converted
    await db
      .update(documents)
      .set({ status: 'converted' })
      .where(eq(documents.id, id));

    return res.status(201).json({ document: newReceipt });
  } catch (error) {
    console.error('Convert document error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// GET /api/documents/stats/summary - Dashboard stats
router.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const allDocs = await db.select().from(documents);

    const stats = {
      totalRevenue: allDocs
        .filter((d) => d.docType === 'receipt' && d.status === 'confirmed')
        .reduce((sum, d) => sum + Number(d.total), 0),
      quotationCount: allDocs.filter((d) => d.docType === 'quotation').length,
      voiCount: allDocs.filter((d) => d.docType === 'voi').length,
      receiptCount: allDocs.filter((d) => d.docType === 'receipt').length,
    };

    return res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

export default router;
