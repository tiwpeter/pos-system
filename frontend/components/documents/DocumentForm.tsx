'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  sku: string | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface DocumentItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Document {
  id: string;
  docNumber: string;
  docType: string;
  customerId: string | null;
  customerName: string | null;
  items: DocumentItem[];
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  notes: string | null;
}

interface DocumentFormProps {
  docType: 'quotation' | 'voi' | 'receipt';
  document?: Document | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentForm({
  docType,
  document,
  onClose,
  onSuccess,
}: DocumentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    document?.customerId || ''
  );
  const [items, setItems] = useState<DocumentItem[]>(
    document?.items || []
  );
  const [notes, setNotes] = useState(document?.notes || '');
  const [status, setStatus] = useState<string>(document?.status || 'draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load customers and products
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/products'),
        ]);
        setCustomers(custRes.data.customers);
        setProducts(prodRes.data.products);
      } catch {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Calculate totals
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.07 * 100) / 100;
  const total = subtotal + tax;

  function addItem() {
    setItems([
      ...items,
      { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: string, value: string | number) {
    const newItems = [...items];
    const item = { ...newItems[idx], [field]: value };

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.productName = product.name;
        item.unitPrice = Number(product.price);
        item.total = item.quantity * Number(product.price);
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : item.quantity;
      const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.total = qty * price;
    }

    newItems[idx] = item;
    setItems(newItems);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    if (items.some((i) => !i.productId)) {
      toast.error('กรุณาเลือกสินค้าทุกรายการ');
      return;
    }

    setSaving(true);
    try {
      const selectedCustomer = customers.find(
        (c) => c.id === selectedCustomerId
      );
      const payload = {
        docType,
        customerId: selectedCustomerId || null,
        customerName: selectedCustomer?.name || null,
        items,
        notes: notes || null,
        status,
      };

      if (document) {
        await api.patch(`/api/documents/${document.id}`, payload);
        toast.success('บันทึกการแก้ไขเรียบร้อยแล้ว');
      } else {
        await api.post('/api/documents', payload);
        toast.success('สร้างเอกสารเรียบร้อยแล้ว');
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">
            {document ? 'แก้ไขเอกสาร' : 'สร้างเอกสารใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-5 space-y-5">
            {/* Customer Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ลูกค้า
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                >
                  <option value="">-- เลือกลูกค้า --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  สถานะ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                >
                  <option value="draft">ร่าง</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  รายการสินค้า
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มสินค้า
                </button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>ยังไม่มีรายการสินค้า</p>
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-2 text-primary hover:underline text-xs"
                    >
                      + เพิ่มสินค้า
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                          สินค้า
                        </th>
                        <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium w-20">
                          จำนวน
                        </th>
                        <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium w-28">
                          ราคา/หน่วย
                        </th>
                        <th className="text-right px-3 py-2 text-xs text-muted-foreground font-medium w-28">
                          รวม
                        </th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <select
                              value={item.productId}
                              onChange={(e) =>
                                updateItem(idx, 'productId', e.target.value)
                              }
                              className="w-full bg-transparent text-foreground text-sm focus:outline-none"
                              required
                            >
                              <option value="">-- เลือกสินค้า --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  idx,
                                  'quantity',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-right bg-transparent text-foreground text-sm focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  idx,
                                  'unitPrice',
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-right bg-transparent text-foreground text-sm focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-foreground font-medium">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Totals */}
            {items.length > 0 && (
              <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ราคารวม</span>
                  <span className="text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT 7%</span>
                  <span className="text-foreground">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span className="text-foreground">ยอดรวมทั้งสิ้น</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                หมายเหตุ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม..."
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all text-sm font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/25"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
