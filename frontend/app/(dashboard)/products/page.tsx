'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStockConfig } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  createdAt: string;
}

function ProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    stock: String(product?.stock ?? 0),
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('กรุณากรอกชื่อสินค้าและราคา');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (product) {
        await api.patch(`/api/products/${product.id}`, payload);
        toast.success('แก้ไขสินค้าเรียบร้อยแล้ว');
      } else {
        await api.post('/api/products', payload);
        toast.success('เพิ่มสินค้าเรียบร้อยแล้ว');
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              ชื่อสินค้า <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อสินค้า"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="รหัสสินค้า"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                ราคา (฿) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">จำนวนสต็อก</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all text-sm font-medium">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/25">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</> : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/api/products${params}`);
      setProducts(data.products);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('ลบสินค้าเรียบร้อยแล้ว');
      fetchProducts();
    } catch {
      toast.error('ไม่สามารถลบได้');
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสินค้า
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">ไม่พบสินค้า</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left">ชื่อสินค้า</th>
                  <th className="text-left hidden md:table-cell">SKU</th>
                  <th className="text-right">ราคา</th>
                  <th className="text-center">สต็อก</th>
                  <th className="text-left hidden lg:table-cell">วันที่เพิ่ม</th>
                  <th className="text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stockCfg = getStockConfig(p.stock);
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="font-medium text-foreground text-sm">{p.name}</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground font-mono">{p.sku || '-'}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-foreground text-sm">{formatCurrency(p.price)}</span>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                              stockCfg.className
                            )}
                          >
                            {stockCfg.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{p.stock} ชิ้น</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditProduct(p); setShowModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchProducts(); }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-muted-foreground mb-6">คุณต้องการลบสินค้านี้ใช่หรือไม่?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all text-sm font-medium">
                ยกเลิก
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-all text-sm">
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
