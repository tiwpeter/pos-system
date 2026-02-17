'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ClipboardList,
  Truck,
  Receipt,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { formatCurrency } from '@/lib/utils';

interface Stats {
  totalRevenue: number;
  quotationCount: number;
  voiCount: number;
  receiptCount: number;
}

interface Document {
  id: string;
  docNumber: string;
  docType: string;
  customerName: string | null;
  total: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, docsRes] = await Promise.all([
          api.get('/api/documents/stats/summary'),
          api.get('/api/documents'),
        ]);
        setStats(statsRes.data.stats);
        setRecentDocs(docsRes.data.documents.slice(0, 8));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="รายรับรวม (ใบเสร็จ)"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="ใบเสนอราคา"
          value={String(stats?.quotationCount || 0)}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="ใบส่งของ"
          value={String(stats?.voiCount || 0)}
          icon={Truck}
          color="yellow"
        />
        <StatCard
          title="ใบเสร็จรับเงิน"
          value={String(stats?.receiptCount || 0)}
          icon={Receipt}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/quotations"
          className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:bg-card/80 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground mb-1">สร้างใบเสนอราคา</p>
              <p className="text-xs text-muted-foreground">ใบเสนอราคาใหม่</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </Link>
        <Link
          href="/voi"
          className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:bg-card/80 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground mb-1">สร้างใบส่งของ</p>
              <p className="text-xs text-muted-foreground">ใบส่งของใหม่</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </Link>
        <Link
          href="/receipts"
          className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:bg-card/80 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground mb-1">สร้างใบเสร็จ</p>
              <p className="text-xs text-muted-foreground">ใบเสร็จรับเงินใหม่</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Documents */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">เอกสารล่าสุด</h2>
          <Link
            href="/quotations"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-2">
          <RecentDocuments documents={recentDocs} />
        </div>
      </div>
    </div>
  );
}
