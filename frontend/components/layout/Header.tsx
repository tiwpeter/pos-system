'use client';

import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    toast.promise(logout(), {
      loading: 'กำลังออกจากระบบ...',
      success: 'ออกจากระบบเรียบร้อยแล้ว',
      error: 'เกิดข้อผิดพลาด',
    });
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-foreground text-lg">{title}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <span className="text-sm text-muted-foreground">
            {user?.fullName || user?.username}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
            {user?.role === 'owner' ? 'เจ้าของ' : 'ผู้ดูแล'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
