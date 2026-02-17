import * as bcrypt from 'bcryptjs';
import { db, pool } from './index';
import { users, customers, products, documents } from './schema';
import type { DocumentItem } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // ─── Clear existing data ──────────────────────────────────────────────────
  await db.delete(documents);
  await db.delete(products);
  await db.delete(customers);
  await db.delete(users);
  console.log('🗑️  Cleared existing data');

  // ─── Users ────────────────────────────────────────────────────────────────
  const ownerHash = await bcrypt.hash('owner123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const [owner, admin] = await db
    .insert(users)
    .values([
      {
        username: 'owner',
        passwordHash: ownerHash,
        fullName: 'เจ้าของร้าน',
        role: 'owner',
      },
      {
        username: 'admin',
        passwordHash: adminHash,
        fullName: 'ผู้ดูแลระบบ',
        role: 'admin',
      },
    ])
    .returning();
  console.log('👥 Created users:', owner.username, admin.username);

  // ─── Customers ────────────────────────────────────────────────────────────
  const [c1, c2, c3, c4, c5] = await db
    .insert(customers)
    .values([
      {
        name: 'บริษัท เทคโนโลยี ไทย จำกัด',
        phone: '02-123-4567',
        email: 'contact@thaitech.co.th',
      },
      {
        name: 'บริษัท นวัตกรรม ดิจิทัล จำกัด',
        phone: '02-234-5678',
        email: 'info@digitalinno.co.th',
      },
      {
        name: 'ห้างหุ้นส่วนจำกัด สมาร์ท โซลูชัน',
        phone: '02-345-6789',
        email: 'smart@solution.co.th',
      },
      {
        name: 'บริษัท ไทยคอม ซิสเต็มส์ จำกัด',
        phone: '02-456-7890',
        email: 'sales@thaicomsys.com',
      },
      {
        name: 'ร้าน ไอที เวิลด์',
        phone: '081-567-8901',
        email: 'itworld@gmail.com',
      },
    ])
    .returning();
  console.log('🏢 Created 5 customers');

  // ─── Products ─────────────────────────────────────────────────────────────
  const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10] = await db
    .insert(products)
    .values([
      {
        name: 'โน้ตบุ๊ก เลโนโว IdeaPad 3',
        sku: 'NB-LEN-001',
        price: '18900.00',
        stock: 15,
      },
      {
        name: 'จอมอนิเตอร์ LG 24 นิ้ว Full HD',
        sku: 'MON-LG-001',
        price: '4500.00',
        stock: 30,
      },
      {
        name: 'คีย์บอร์ดไร้สาย Logitech MK470',
        sku: 'KB-LOG-001',
        price: '1290.00',
        stock: 50,
      },
      {
        name: 'เมาส์ไร้สาย Logitech M650',
        sku: 'MS-LOG-001',
        price: '890.00',
        stock: 60,
      },
      {
        name: 'หูฟัง Sony WH-1000XM4',
        sku: 'HP-SNY-001',
        price: '9900.00',
        stock: 8,
      },
      {
        name: 'เว็บแคม Logitech C920',
        sku: 'CAM-LOG-001',
        price: '2490.00',
        stock: 25,
      },
      {
        name: 'แท่นชาร์จ USB-C Hub 7-in-1',
        sku: 'HUB-UC-001',
        price: '1590.00',
        stock: 40,
      },
      {
        name: 'SSD ภายนอก Samsung T7 1TB',
        sku: 'SSD-SAM-001',
        price: '3290.00',
        stock: 20,
      },
      {
        name: 'แรม Corsair 16GB DDR4',
        sku: 'RAM-COR-001',
        price: '2190.00',
        stock: 35,
      },
      {
        name: 'เราเตอร์ TP-Link AX1800',
        sku: 'RT-TPL-001',
        price: '1890.00',
        stock: 0,
      },
    ])
    .returning();
  console.log('📦 Created 10 products');

  // ─── Documents ────────────────────────────────────────────────────────────
  const items1: DocumentItem[] = [
    {
      productId: p1.id,
      productName: p1.name,
      quantity: 2,
      unitPrice: 18900,
      total: 37800,
    },
    {
      productId: p2.id,
      productName: p2.name,
      quantity: 2,
      unitPrice: 4500,
      total: 9000,
    },
    {
      productId: p3.id,
      productName: p3.name,
      quantity: 2,
      unitPrice: 1290,
      total: 2580,
    },
  ];
  const subtotal1 = 49380;
  const tax1 = Math.round(subtotal1 * 0.07 * 100) / 100;
  const total1 = subtotal1 + tax1;

  const items2: DocumentItem[] = [
    {
      productId: p5.id,
      productName: p5.name,
      quantity: 3,
      unitPrice: 9900,
      total: 29700,
    },
    {
      productId: p6.id,
      productName: p6.name,
      quantity: 3,
      unitPrice: 2490,
      total: 7470,
    },
  ];
  const subtotal2 = 37170;
  const tax2 = Math.round(subtotal2 * 0.07 * 100) / 100;
  const total2 = subtotal2 + tax2;

  const items3: DocumentItem[] = [
    {
      productId: p7.id,
      productName: p7.name,
      quantity: 5,
      unitPrice: 1590,
      total: 7950,
    },
    {
      productId: p8.id,
      productName: p8.name,
      quantity: 2,
      unitPrice: 3290,
      total: 6580,
    },
  ];
  const subtotal3 = 14530;
  const tax3 = Math.round(subtotal3 * 0.07 * 100) / 100;
  const total3 = subtotal3 + tax3;

  const items4: DocumentItem[] = [
    {
      productId: p1.id,
      productName: p1.name,
      quantity: 1,
      unitPrice: 18900,
      total: 18900,
    },
    {
      productId: p4.id,
      productName: p4.name,
      quantity: 1,
      unitPrice: 890,
      total: 890,
    },
  ];
  const subtotal4 = 19790;
  const tax4 = Math.round(subtotal4 * 0.07 * 100) / 100;
  const total4 = subtotal4 + tax4;

  const items5: DocumentItem[] = [
    {
      productId: p9.id,
      productName: p9.name,
      quantity: 4,
      unitPrice: 2190,
      total: 8760,
    },
    {
      productId: p10.id,
      productName: p10.name,
      quantity: 2,
      unitPrice: 1890,
      total: 3780,
    },
  ];
  const subtotal5 = 12540;
  const tax5 = Math.round(subtotal5 * 0.07 * 100) / 100;
  const total5 = subtotal5 + tax5;

  await db.insert(documents).values([
    {
      docNumber: 'QT-2024-001',
      docType: 'quotation',
      customerId: c1.id,
      customerName: c1.name,
      items: items1,
      subtotal: subtotal1.toFixed(2),
      tax: tax1.toFixed(2),
      total: total1.toFixed(2),
      status: 'confirmed',
      notes: 'ใบเสนอราคาสำหรับอุปกรณ์คอมพิวเตอร์สำนักงาน',
      createdBy: owner.id,
    },
    {
      docNumber: 'QT-2024-002',
      docType: 'quotation',
      customerId: c2.id,
      customerName: c2.name,
      items: items2,
      subtotal: subtotal2.toFixed(2),
      tax: tax2.toFixed(2),
      total: total2.toFixed(2),
      status: 'draft',
      notes: 'รอการอนุมัติจากฝ่ายจัดซื้อ',
      createdBy: admin.id,
    },
    {
      docNumber: 'VD-2024-001',
      docType: 'voi',
      customerId: c3.id,
      customerName: c3.name,
      items: items3,
      subtotal: subtotal3.toFixed(2),
      tax: tax3.toFixed(2),
      total: total3.toFixed(2),
      status: 'confirmed',
      notes: 'ส่งของตามใบสั่งซื้อ PO-2024-045',
      createdBy: owner.id,
    },
    {
      docNumber: 'RC-2024-001',
      docType: 'receipt',
      customerId: c4.id,
      customerName: c4.name,
      items: items4,
      subtotal: subtotal4.toFixed(2),
      tax: tax4.toFixed(2),
      total: total4.toFixed(2),
      status: 'confirmed',
      notes: 'ชำระเงินเรียบร้อยแล้ว',
      createdBy: admin.id,
    },
    {
      docNumber: 'RC-2024-002',
      docType: 'receipt',
      customerId: c5.id,
      customerName: c5.name,
      items: items5,
      subtotal: subtotal5.toFixed(2),
      tax: tax5.toFixed(2),
      total: total5.toFixed(2),
      status: 'confirmed',
      notes: 'โอนเงินผ่านธนาคาร',
      createdBy: owner.id,
    },
  ]);
  console.log('📄 Created 5 documents');

  console.log('\n✅ Seeding completed!');
  console.log('─────────────────────────────────');
  console.log('🔑 Login credentials:');
  console.log('   Owner  → username: owner  | password: owner123');
  console.log('   Admin  → username: admin  | password: admin123');
  console.log('─────────────────────────────────\n');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
