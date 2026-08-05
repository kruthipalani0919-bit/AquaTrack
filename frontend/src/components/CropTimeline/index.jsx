import React from 'react';
import { CheckCircle2, Clock, Calendar, Sparkles, Sprout, Wheat } from 'lucide-react';

/**
 * Reusable CropTimeline component visualizing culture progress milestones.
 */
export const CropTimeline = ({
  stockingDate,
  expectedHarvestDate,
  doc = 0,
}) => {
  const milestones = [
    {
      stage: 'Stage 1',
      title: 'PL Stocking & Acclimation',
      dayRange: 'Day 0',
      description: 'Seed stocking, salinity matching, and initial nursery feed.',
      icon: Sprout,
      isPassed: doc >= 0,
      isCurrent: doc >= 0 && doc <= 30,
    },
    {
      stage: 'Stage 2',
      title: 'Nursery & Early Growth',
      dayRange: 'Day 1 - 30',
      description: 'Micro-pellet feeding, bloom development, water parameter checks.',
      icon: Sparkles,
      isPassed: doc > 30,
      isCurrent: doc > 30 && doc <= 60,
    },
    {
      stage: 'Stage 3',
      title: 'Main Grower Phase',
      dayRange: 'Day 31 - 90',
      description: 'Check tray sampling, aerator grid management, mineral dosing.',
      icon: Clock,
      isPassed: doc > 90,
      isCurrent: doc > 60 && doc <= 100,
    },
    {
      stage: 'Stage 4',
      title: 'Harvest Target',
      dayRange: 'Target Date',
      description: 'ABW weight check, harvest logistics, processing plant dispatch.',
      icon: Wheat,
      isPassed: doc >= 120,
      isCurrent: doc > 100,
    },
  ];

  return (
    <div className="py-2">
      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-primary" /> Culture Progress Milestone Timeline
      </h4>

      <div className="relative pl-6 border-l-2 border-border/80 space-y-6">
        {milestones.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="relative group">
              {/* Dot Icon Indicator */}
              <div
                className={`
                  absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors
                  ${m.isPassed
                    ? 'bg-primary text-white ring-4 ring-primary-light/60'
                    : m.isCurrent
                    ? 'bg-accent text-white ring-4 ring-accent-light/60 animate-pulse'
                    : 'bg-background border border-border text-text-secondary'
                  }
                `}
              >
                {m.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
              </div>

              <div className="bg-background/60 p-3 rounded-lg border border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                    {m.title}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isCurrent ? 'bg-accent-light text-accent' : 'bg-surface text-text-secondary'}`}>
                    {m.dayRange}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CropTimeline;
