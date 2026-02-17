import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorMap = {
  blue: {
    icon: 'bg-blue-500/20 text-blue-400',
    border: 'border-blue-500/20',
    glow: 'hover:shadow-blue-500/10',
  },
  green: {
    icon: 'bg-green-500/20 text-green-400',
    border: 'border-green-500/20',
    glow: 'hover:shadow-green-500/10',
  },
  yellow: {
    icon: 'bg-yellow-500/20 text-yellow-400',
    border: 'border-yellow-500/20',
    glow: 'hover:shadow-yellow-500/10',
  },
  purple: {
    icon: 'bg-purple-500/20 text-purple-400',
    border: 'border-purple-500/20',
    glow: 'hover:shadow-purple-500/10',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'stat-card hover:shadow-xl',
        colors.glow,
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', colors.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
