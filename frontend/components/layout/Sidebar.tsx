'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ChevronDown,
  ShoppingCart,
  Users,
  Package,
  UserCog,
  X,
  Receipt,
  Truck,
  ClipboardList,
  Files,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [docsExpanded, setDocsExpanded] = useState(true);

  useEffect(() => {
    if (
      pathname.includes('/quotations') ||
      pathname.includes('/voi') ||
      pathname.includes('/receipts') ||
      pathname.includes('/documents')
    ) {
      setDocsExpanded(true);
    }
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const isDocActive = () =>
    ['/quotations', '/voi', '/receipts', '/documents'].some((p) =>
      pathname.includes(p)
    );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">POS System</p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {user?.fullName || user?.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/"
            onClick={onClose}
            className={cn(
              'sidebar-item',
              isActive('/') ? 'sidebar-item-active' : 'sidebar-item-inactive'
            )}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>แดชบอร์ด</span>
          </Link>

          {/* Documents Section */}
          <div>
            <button
              onClick={() => setDocsExpanded(!docsExpanded)}
              className={cn(
                'sidebar-item w-full justify-between',
                isDocActive()
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>เอกสาร</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  docsExpanded ? 'rotate-180' : ''
                )}
              />
            </button>

            {docsExpanded && (
              <div className="mt-1 ml-4 pl-4 border-l border-border space-y-1">
                {/* เอกสารทั้งหมด */}
                <Link
                  href="/documents"
                  onClick={onClose}
                  className={cn(
                    'sidebar-item text-sm',
                    isActive('/documents')
                      ? 'sidebar-item-active'
                      : 'sidebar-item-inactive'
                  )}
                >
                  <Files className="w-4 h-4 flex-shrink-0" />
                  <span>เอกสารทั้งหมด</span>
                </Link>

                <Link
                  href="/quotations"
                  onClick={onClose}
                  className={cn(
                    'sidebar-item text-sm',
                    pathname.includes('/quotations')
                      ? 'sidebar-item-active'
                      : 'sidebar-item-inactive'
                  )}
                >
                  <ClipboardList className="w-4 h-4 flex-shrink-0" />
                  <span>ใบเสนอราคา</span>
                </Link>

                <Link
                  href="/voi"
                  onClick={onClose}
                  className={cn(
                    'sidebar-item text-sm',
                    pathname.includes('/voi')
                      ? 'sidebar-item-active'
                      : 'sidebar-item-inactive'
                  )}
                >
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>ใบส่งของ</span>
                </Link>

                <Link
                  href="/receipts"
                  onClick={onClose}
                  className={cn(
                    'sidebar-item text-sm',
                    pathname.includes('/receipts')
                      ? 'sidebar-item-active'
                      : 'sidebar-item-inactive'
                  )}
                >
                  <Receipt className="w-4 h-4 flex-shrink-0" />
                  <span>ใบเสร็จรับเงิน</span>
                </Link>
              </div>
            )}
          </div>

          {/* Customers */}
          <Link
            href="/customers"
            onClick={onClose}
            className={cn(
              'sidebar-item',
              pathname.includes('/customers')
                ? 'sidebar-item-active'
                : 'sidebar-item-inactive'
            )}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>ลูกค้า</span>
          </Link>

          {/* Products */}
          <Link
            href="/products"
            onClick={onClose}
            className={cn(
              'sidebar-item',
              pathname.includes('/products')
                ? 'sidebar-item-active'
                : 'sidebar-item-inactive'
            )}
          >
            <Package className="w-4 h-4 flex-shrink-0" />
            <span>สินค้า</span>
          </Link>

          {/* User Management - Owner only */}
          {user?.role === 'owner' && (
            <Link
              href="/users"
              onClick={onClose}
              className={cn(
                'sidebar-item',
                pathname.includes('/users')
                  ? 'sidebar-item-active'
                  : 'sidebar-item-inactive'
              )}
            >
              <UserCog className="w-4 h-4 flex-shrink-0" />
              <span>จัดการผู้ใช้</span>
            </Link>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'owner' ? 'เจ้าของ' : 'ผู้ดูแล'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
