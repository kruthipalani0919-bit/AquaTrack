import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, XCircle, Stethoscope } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable MedicineSchedule component displaying tabs for Upcoming,
 * Completed, and Missed treatments.
 */
export const MedicineSchedule = ({ medicineRecords = [] }) => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'missed'

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingList = medicineRecords.filter(
    (rec) => rec.status === 'Scheduled' || rec.applicationDate > todayStr
  );

  const completedList = medicineRecords.filter((rec) => rec.status === 'Completed');

  const missedList = medicineRecords.filter((rec) => rec.status === 'Missed');

  const displayedList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : missedList;

  return (
    <Card padding="normal" className="border-border/80 bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">Treatment & Medicine Schedule</h3>
            <p className="text-[11px] text-text-secondary">Track upcoming dosage plans and application history</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border shrink-0">
          <Button
            variant={activeTab === 'upcoming' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
            className="text-xs"
          >
            Upcoming ({upcomingList.length})
          </Button>

          <Button
            variant={activeTab === 'completed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('completed')}
            className="text-xs"
          >
            Completed ({completedList.length})
          </Button>

          <Button
            variant={activeTab === 'missed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('missed')}
            className="text-xs"
          >
            Missed ({missedList.length})
          </Button>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="mt-4 space-y-3">
        {displayedList.length > 0 ? (
          displayedList.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl border border-border/60 bg-background/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-border"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-text-primary truncate">{rec.medicineName}</h4>
                    <span className="text-[10px] text-text-secondary font-medium">({rec.category})</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                    Dosage: <span className="font-semibold text-text-primary">{rec.dosage} {rec.unit}</span> in {rec.tankName} ({rec.cropName})
                  </p>
                  {rec.purpose && (
                    <p className="text-[10px] text-text-secondary mt-0.5 italic truncate">
                      Purpose: {rec.purpose}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <Badge
                  variant={
                    rec.status === 'Completed'
                      ? 'success'
                      : rec.status === 'Scheduled'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {rec.status}
                </Badge>
                <span className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> {rec.applicationDate} at {rec.applicationTime}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-xl">
            No {activeTab} treatment records found.
          </div>
        )}
      </div>
    </Card>
  );
};

export default MedicineSchedule;
