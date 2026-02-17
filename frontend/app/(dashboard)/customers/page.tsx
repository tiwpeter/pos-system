'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Phone, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
}

function CustomerModal({
  customer,
  onClose,
  onSuccess,
}: {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CustomerFormData>({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('กรุณากรอกชื่อลูกค้า');
      return;
    }
    setSaving(true);
    try {
      if (customer) {
        await api.patch(`/api/customers/${customer.id}`, form);
        toast.success('แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว');
      } else {
        await api.post('/api/customers', form);
        toast.success('เพิ่มลูกค้าเรียบร้อยแล้ว');
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
            {customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              ชื่อ <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อบริษัทหรือบุคคล"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              เบอร์โทร
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="02-xxx-xxxx"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/api/customers${params}`);
      setCustomers(data.customers);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/customers/${id}`);
      toast.success('ลบลูกค้าเรียบร้อยแล้ว');
      fetchCustomers();
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
            placeholder="ค้นหาลูกค้า..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <button
          onClick={() => { setEditCustomer(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          เพิ่มลูกค้า
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">ไม่พบลูกค้า</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left">ชื่อ</th>
                  <th className="text-left hidden md:table-cell">เบอร์โทร</th>
                  <th className="text-left hidden lg:table-cell">อีเมล</th>
                  <th className="text-left hidden xl:table-cell">วันที่เพิ่ม</th>
                  <th className="text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-medium text-foreground text-sm">{c.name}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      {c.phone ? (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />{c.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell">
                      {c.email ? (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />{c.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditCustomer(c); setShowModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchCustomers(); }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-muted-foreground mb-6">คุณต้องการลบลูกค้านี้ใช่หรือไม่?</p>
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
