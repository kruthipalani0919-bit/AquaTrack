import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';

/**
 * Reusable FeedSchedule component displaying today's 4 daily feeding time slots
 * and tray check completion indicators.
 */
export const FeedSchedule = ({ feedLogs = [] }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todaysLogs = feedLogs.filter((log) => log.feedingDate === todayStr);

  const scheduleSlots = [
    {
      time: '06:00 AM',
      label: 'Morning Ration',
      icon: Sunrise,
      color: 'text-amber-500 bg-amber-50',
      matchedLog: todaysLogs.find((l) => l.feedingTime === '06:00 AM'),
    },
    {
      time: '11:00 AM',
      label: 'Noon Ration',
      icon: Sun,
      color: 'text-yellow-600 bg-yellow-50',
      matchedLog: todaysLogs.find((l) => l.feedingTime === '11:00 AM'),
    },
    {
      time: '03:00 PM',
      label: 'Afternoon Ration',
      icon: Sunset,
      color: 'text-orange-500 bg-orange-50',
      matchedLog: todaysLogs.find((l) => l.feedingTime === '03:00 PM'),
    },
    {
      time: '07:00 PM',
      label: 'Evening Ration',
      icon: Moon,
      color: 'text-indigo-500 bg-indigo-50',
      matchedLog: todaysLogs.find((l) => l.feedingTime === '07:00 PM'),
    },
  ];

  return (
    <Card padding="normal" className="border-border/80 bg-surface">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">Today's Feeding Schedule</h3>
            <p className="text-[11px] text-text-secondary">4 Daily feeding slots & tray check logs</p>
          </div>
        </div>

        <Badge variant="primary" size="sm">
          {todaysLogs.filter((l) => l.status === 'Completed').length} / 4 Completed
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {scheduleSlots.map((slot, idx) => {
          const Icon = slot.icon;
          const log = slot.matchedLog;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                log?.status === 'Completed'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : log?.status === 'Scheduled'
                  ? 'border-warning/40 bg-warning-light/30'
                  : 'border-border/60 bg-background/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${slot.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">{slot.time}</span>
                </div>

                {log ? (
                  <Badge
                    variant={
                      log.status === 'Completed'
                        ? 'success'
                        : log.status === 'Scheduled'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                    className="text-[9px] px-1.5 py-0"
                  >
                    {log.status}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm" className="text-[9px] px-1.5 py-0">
                    Pending
                  </Badge>
                )}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <span className="text-[11px] font-semibold text-text-primary block truncate">
                  {log ? `${log.quantityKg} kg - ${log.feedBrand}` : slot.label}
                </span>
                <span className="text-[10px] text-text-secondary block truncate">
                  {log ? `${log.cropName} (${log.tankName})` : 'No log recorded'}
                </span>
              </div>

              {log?.notes && (
                <p className="text-[10px] text-text-secondary mt-2 pt-2 border-t border-border/40 italic line-clamp-1">
                  "{log.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default FeedSchedule;
