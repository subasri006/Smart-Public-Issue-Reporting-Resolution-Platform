import React from 'react';
import { ShieldAlert, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const SeverityBadge = ({ severity, size = 'md' }) => {
  const configs = {
    LOW: {
      label: 'Low',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Info,
    },
    MEDIUM: {
      label: 'Medium',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'High',
      classes: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertOctagon,
    },
    CRITICAL: {
      label: 'Critical',
      classes: 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse',
      icon: ShieldAlert,
    },
  };

  const config = configs[severity] || configs.LOW;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.classes} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};
