'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  cn,
  formatCurrency,
  formatDate,
  getDocTypeLabel,
  getStatusConfig,
} from '@/lib/utils';

interface Document {
  id: string;
  docNumber: string;
  docType: string;
  customerName: string | null;
  total: string;
  status: string;
  createdAt: string;
}

export default function AllDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const { data } = await api.get('/api/documents?' + params);
      setDocuments(data.documents);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const docTypeColors: Record<string, string> = {
    quotation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    voi: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    receipt: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

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
            placeholder="ค้นหาเอกสาร..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none min-w-[150px]"
          >
            <option value="">ทุกประเภท</option>
            <option value="quotation">ใบเสนอราคา</option>
            <option value="voi">ใบส่งของ</option>
            <option value="receipt">ใบเสร็จรับเงิน</option>
          </select>
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
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">
          ทั้งหมด {documents.length} รายการ
        </span>
        {['quotation', 'voi', 'receipt'].map((type) => {
          const count = documents.filter((d) => d.docType === type).length;
          return count > 0 ? (
            <span
              key={type}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                docTypeColors[type]
              )}
            >
              {getDocTypeLabel(type)} {count}
            </span>
          ) : null;
        })}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">ไม่พบเอกสาร</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left">เลขที่</th>
                  <th className="text-left">ประเภท</th>
                  <th className="text-left hidden md:table-cell">ลูกค้า</th>
                  <th className="text-right">ยอดรวม</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-left hidden lg:table-cell">วันที่</th>
                  <th className="text-right">ดู</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const statusCfg = getStatusConfig(doc.status);
                  return (
                    <tr
                      key={doc.id}
                      className="cursor-pointer"
                      onClick={() => router.push('/documents/' + doc.id)}
                    >
                      <td>
                        <span className="font-medium text-primary text-sm hover:underline">
                          {doc.docNumber}
                        </span>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            docTypeColors[doc.docType]
                          )}
                        >
                          {getDocTypeLabel(doc.docType)}
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
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push('/documents/' + doc.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
