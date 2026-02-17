'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { DocumentForm } from './DocumentForm';
import {
  cn,
  formatCurrency,
  formatDate,
  getStatusConfig,
} from '@/lib/utils';

interface Document {
  id: string;
  docNumber: string;
  docType: string;
  customerId: string | null;
  customerName: string | null;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface DocumentListProps {
  docType: 'quotation' | 'voi' | 'receipt';
  title: string;
}

export function DocumentList({ docType, title }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: docType });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const { data } = await api.get(`/api/documents?${params}`);
      setDocuments(data.documents);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [docType, statusFilter, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success('ลบเอกสารเรียบร้อยแล้ว');
      fetchDocuments();
    } catch {
      toast.error('ไม่สามารถลบได้');
    } finally {
      setDeleteId(null);
    }
  }

  async function handleConvert(id: string) {
    setConverting(id);
    try {
      await api.post(`/api/documents/${id}/convert`);
      toast.success('แปลงเป็นใบเสร็จเรียบร้อยแล้ว');
      fetchDocuments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'ไม่สามารถแปลงได้');
    } finally {
      setConverting(null);
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
            placeholder={`ค้นหา${title}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none min-w-[140px]"
          >
            <option value="">ทุกสถานะ</option>
            <option value="draft">ร่าง</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="converted">แปลงแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditDoc(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          สร้างใหม่
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">ไม่พบ{title}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left">เลขที่</th>
                  <th className="text-left hidden md:table-cell">ลูกค้า</th>
                  <th className="text-right">ยอดรวม</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-left hidden lg:table-cell">วันที่</th>
                  <th className="text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const statusCfg = getStatusConfig(doc.status);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <span className="font-medium text-foreground text-sm">
                          {doc.docNumber}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground truncate max-w-[180px] block">
                          {doc.customerName || '-'}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-foreground text-sm">
                          {formatCurrency(doc.total)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            statusCfg.className
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Convert button (quotation only) */}
                          {docType === 'quotation' &&
                            doc.status !== 'converted' &&
                            doc.status !== 'cancelled' && (
                              <button
                                onClick={() => handleConvert(doc.id)}
                                disabled={converting === doc.id}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 transition-colors"
                                title="แปลงเป็นใบเสร็จ"
                              >
                                {converting === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditDoc(doc);
                              setShowForm(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteId(doc.id)}
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

      {/* Document Form Modal */}
      {showForm && (
        <DocumentForm
          docType={docType}
          document={editDoc}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchDocuments();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-muted-foreground mb-6">
              คุณต้องการลบเอกสารนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-all text-sm"
              >
                ลบเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
