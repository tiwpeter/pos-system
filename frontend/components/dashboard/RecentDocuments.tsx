'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cn, formatCurrency, formatDate, getDocTypeLabel, getStatusConfig } from '@/lib/utils';

interface Document {
  id: string;
  docNumber: string;
  docType: string;
  customerName: string | null;
  total: string;
  status: string;
  createdAt: string;
}

interface RecentDocumentsProps {
  documents: Document[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">ยังไม่มีเอกสาร</p>
      </div>
    );
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const statusCfg = getStatusConfig(doc.status);
            const docPath =
              doc.docType === 'quotation'
                ? '/quotations'
                : doc.docType === 'voi'
                ? '/voi'
                : '/receipts';

            return (
              <tr key={doc.id}>
                <td>
                  <Link
                    href={docPath}
                    className="text-primary hover:underline font-medium text-sm flex items-center gap-1"
                  >
                    {doc.docNumber}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">
                    {getDocTypeLabel(doc.docType)}
                  </span>
                </td>
                <td className="hidden md:table-cell">
                  <span className="text-sm text-foreground truncate max-w-[200px] block">
                    {doc.customerName || '-'}
                  </span>
                </td>
                <td className="text-right">
                  <span className="text-sm font-semibold text-foreground">
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
