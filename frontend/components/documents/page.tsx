'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  FileDown,
  Loader2,
  Hash,
  Calendar,
  User,
  StickyNote,
  FileText,
  Building2,
  ArrowRightLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  cn,
  formatCurrency,
  formatDate,
  getDocTypeLabel,
  getStatusConfig,
} from '@/lib/utils';

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
  createdAt: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const { data } = await api.get(`/api/documents/${params.id}`);
        setDoc(data.document);
      } catch {
        toast.error('ไม่พบเอกสาร');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchDoc();
  }, [params.id, router]);

  async function handleConvert() {
    if (!doc) return;
    setConverting(true);
    try {
      const { data } = await api.post(`/api/documents/${doc.id}/convert`);
      toast.success('แปลงเป็นใบเสร็จเรียบร้อยแล้ว');
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'ไม่สามารถแปลงได้');
    } finally {
      setConverting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleExportPDF() {
    // Use browser's print-to-PDF
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doc) return null;

  const statusCfg = getStatusConfig(doc.status);

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything except print area */
          body * { visibility: hidden; }
          #document-print-area, #document-print-area * { visibility: visible; }
          #document-print-area {
            position: fixed;
            inset: 0;
            padding: 2rem;
            background: white;
            color: black;
          }
          .no-print { display: none !important; }
          /* Print typography */
          #document-print-area { font-family: 'Sarabun', sans-serif; }
          .print-table th, .print-table td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            font-size: 13px;
          }
          .print-table { border-collapse: collapse; width: 100%; }
          .print-header { border-bottom: 2px solid #1e40af; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .print-totals { border-top: 2px solid #1e40af; margin-top: 1rem; padding-top: 1rem; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>

          <div className="flex items-center gap-2">
            {/* Convert button for quotation */}
            {doc.docType === 'quotation' &&
              doc.status !== 'converted' &&
              doc.status !== 'cancelled' && (
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
                >
                  {converting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-4 h-4" />
                  )}
                  แปลงเป็นใบเสร็จ
                </button>
              )}

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/25"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>
          </div>
        </div>

        {/* Document Card */}
        <div
          id="document-print-area"
          ref={printRef}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Document Header */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Company / Doc Type */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {getDocTypeLabel(doc.docType)}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {doc.docNumber}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border self-start',
                  statusCfg.className
                )}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border">
            {/* Doc Number */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="w-3.5 h-3.5" />
                เลขที่เอกสาร
              </div>
              <p className="font-semibold text-foreground">{doc.docNumber}</p>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                วันที่
              </div>
              <p className="font-semibold text-foreground">{formatDate(doc.createdAt)}</p>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                ประเภทเอกสาร
              </div>
              <p className="font-semibold text-foreground">{getDocTypeLabel(doc.docType)}</p>
            </div>
          </div>

          {/* Customer Info */}
          {doc.customerName && (
            <div className="px-6 py-4 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">ข้อมูลลูกค้า</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {doc.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{doc.customerName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              รายการสินค้า
              <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {doc.items?.length || 0} รายการ
              </span>
            </h2>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm print-table">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">
                      ลำดับ
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">
                      รายการสินค้า
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold w-20">
                      จำนวน
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-semibold w-32">
                      ราคา/หน่วย
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-semibold w-32">
                      รวม
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doc.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.productName}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 border-b border-border">
            <div className="sm:ml-auto sm:max-w-xs space-y-3 print-totals">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">ราคารวม (ก่อน VAT)</span>
                <span className="text-foreground font-medium">{formatCurrency(doc.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">ภาษีมูลค่าเพิ่ม 7%</span>
                <span className="text-foreground font-medium">{formatCurrency(doc.tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold text-foreground text-base">ยอดรวมทั้งสิ้น</span>
                <span className="font-bold text-primary text-xl">{formatCurrency(doc.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {doc.notes && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">หมายเหตุ</span>
              </div>
              <p className="text-sm text-foreground bg-secondary/30 rounded-xl px-4 py-3 leading-relaxed">
                {doc.notes}
              </p>
            </div>
          )}

          {/* Footer for print */}
          <div className="hidden print:block px-6 pb-6 mt-8">
            <div className="grid grid-cols-3 gap-8 text-center text-sm">
              <div>
                <div className="border-t border-gray-400 pt-2 mt-12">ผู้จัดทำ</div>
              </div>
              <div>
                <div className="border-t border-gray-400 pt-2 mt-12">ผู้ตรวจสอบ</div>
              </div>
              <div>
                <div className="border-t border-gray-400 pt-2 mt-12">ผู้อนุมัติ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
