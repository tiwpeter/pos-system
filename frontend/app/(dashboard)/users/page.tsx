'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, UserCog, Shield, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  fullName: string | null;
  role: 'owner' | 'admin';
  createdAt: string;
}

function InviteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'admin' as 'owner' | 'admin',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/users/invite', form);
      toast.success('เพิ่มผู้ใช้เรียบร้อยแล้ว');
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
          <h2 className="font-semibold text-foreground">เพิ่มผู้ใช้ใหม่</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              ชื่อผู้ใช้ <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="username"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              รหัสผ่าน <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="ชื่อเต็ม (ไม่บังคับ)"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">บทบาท</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as 'owner' | 'admin' })}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="admin">ผู้ดูแล (Admin)</option>
              <option value="owner">เจ้าของ (Owner)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all text-sm font-medium">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/25">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</> : 'เพิ่มผู้ใช้'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: 'owner' | 'admin') {
    setChangingRole(userId);
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      toast.success('เปลี่ยนบทบาทเรียบร้อยแล้ว');
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'ไม่สามารถเปลี่ยนบทบาทได้');
    } finally {
      setChangingRole(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left">ชื่อผู้ใช้</th>
                  <th className="text-left hidden md:table-cell">ชื่อ-นามสกุล</th>
                  <th className="text-center">บทบาท</th>
                  <th className="text-left hidden lg:table-cell">วันที่สร้าง</th>
                  <th className="text-right">เปลี่ยนบทบาท</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentUser = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground text-sm">{u.username}</span>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(คุณ)</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{u.fullName || '-'}</span>
                      </td>
                      <td className="text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          u.role === 'owner'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {u.role === 'owner' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                          {u.role === 'owner' ? 'เจ้าของ' : 'ผู้ดูแล'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="text-right">
                        {!isCurrentUser ? (
                          <div className="flex items-center justify-end gap-2">
                            {changingRole === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleRoleChange(u.id, e.target.value as 'owner' | 'admin')
                                }
                                className="text-sm bg-secondary border border-border text-foreground rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <option value="admin">ผู้ดูแล</option>
                                <option value="owner">เจ้าของ</option>
                              </select>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">ไม่สามารถเปลี่ยนได้</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}
