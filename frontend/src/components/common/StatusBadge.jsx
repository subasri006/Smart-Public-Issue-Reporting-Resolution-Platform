import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    SUBMITTED: {
      label: 'Submitted',
      classes: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Clock,
    },
    ASSIGNED: {
      label: 'Assigned',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ArrowUpRight,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      classes: 'bg-amber-50 text-amber-700 border-amber-300',
      icon: AlertCircle,
    },
    RESOLVED: {
      label: 'Resolved',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      icon: CheckCircle2,
    },
    REOPENED: {
      label: 'Reopened',
      classes: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: RotateCcw,
    },
  };

  const config = configs[status] || configs.SUBMITTED;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.classes} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};
