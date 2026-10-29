import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  User, 
  RotateCcw, 
  Wrench, 
  Send 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        No workflow events recorded yet.
      </div>
    );
  }

  const getEventIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Send className="w-4 h-4 text-slate-600" />;
      case 'ASSIGNED':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-slate-100 border-slate-300';
      case 'ASSIGNED': return 'bg-blue-100 border-blue-300';
      case 'IN_PROGRESS': return 'bg-amber-100 border-amber-300';
      case 'RESOLVED': return 'bg-emerald-100 border-emerald-300';
      case 'REOPENED': return 'bg-rose-100 border-rose-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          const date = new Date(event.createdAt);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {/* Connecting line */}
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Icon Node */}
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border shadow-sm ${getStatusColor(event.newStatus)}`}>
                    {getEventIcon(event.newStatus)}
                  </div>

                  <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {event.previousStatus ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <StatusBadge status={event.previousStatus} size="sm" />
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <StatusBadge status={event.newStatus} size="sm" />
                          </div>
                        ) : (
                          <StatusBadge status={event.newStatus} size="sm" />
                        )}

                        <span className="text-xs text-slate-500">
                          by <strong className="text-slate-700">{event.changedByName || 'System'}</strong>
                          {event.changedByRole && (
                            <span className="ml-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {event.changedByRole}
                            </span>
                          )}
                        </span>
                      </div>

                      {event.comment && (
                        <p className="mt-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {event.comment}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[11px] whitespace-nowrap text-slate-600 font-mono">
                      <time dateTime={event.createdAt}>{formattedDate}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
