import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  UtensilsCrossed,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  Waves,
  Sprout,
  CheckCircle2
} from 'lucide-react';

import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, farm: authFarm } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatic Frontend Data Loading on Mount and Window Focus
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await dashboardService.getDashboard();
      setDashboardData(res.data || res);
    } catch (err) {
      console.log('Dashboard fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();

    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadDashboardData]);

  const stats = dashboardData?.statistics || {};
  const farm = dashboardData?.farm || authFarm || {};

  const hasFarmConfigured = Boolean(farm?.farmName || authFarm?.farmName || (stats.totalTanks || 0) > 0);

  // Farm Operational Metrics (Exactly 3 Summary Cards)
  const operationalMetrics = [
    {
      id: 'tanks',
      title: 'Total Tanks',
      value: stats.totalTanks ?? 0,
      description: farm.farmName ? `${farm.farmName} (${farm.totalAcres || 0} Acres)` : 'Configured farm ponds',
      icon: Waves,
      bgColor: 'bg-teal-50 text-teal-700',
    },
    {
      id: 'crops',
      title: 'Active Crop Batches',
      value: stats.activeCrops ?? 0,
      description: `${stats.completedCrops || 0} batches completed`,
      icon: Sprout,
      bgColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'completed',
      title: 'Completed Batches',
      value: stats.completedCrops ?? 0,
      description: 'Finished crop harvests',
      icon: CheckCircle2,
      bgColor: 'bg-indigo-50 text-indigo-700',
    },
  ];

  // Quick Actions Navigation Links
  const quickActions = [
    { label: 'Stocking Management', path: '/stocking', icon: Boxes },
    { label: 'Feed Management', path: '/feed', icon: UtensilsCrossed },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. WELCOME SECTION */}
      <div className="relative rounded-2xl bg-gradient-to-r from-teal-900 via-primary to-teal-800 text-white p-5 sm:p-6 shadow-md overflow-hidden border border-teal-700/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome to AquaTrack
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl">
              {hasFarmConfigured
                ? `Centralized operational overview for ${farm.farmName}.`
                : 'Complete your farm setup to begin managing your operations.'}
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/farm-setup')}
              icon={<ArrowRight className="w-4 h-4 text-primary" />}
              iconPosition="right"
              className="bg-white text-primary hover:bg-teal-50 font-bold px-6 py-2.5 text-sm shadow-md border-none transition-transform hover:scale-105"
            >
              {hasFarmConfigured ? 'Manage Farm' : 'Create Farm Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="bg-surface border border-border/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-[11px] text-text-secondary">Direct access to active modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl transition-all text-center group cursor-pointer border bg-primary-light/30 border-primary/30 hover:border-primary/60 hover:bg-primary-light/50 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 shadow-2xs border transition-transform group-hover:scale-105 bg-primary-light text-primary border-primary/30">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs leading-tight transition-colors font-bold text-primary">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FARM SUMMARY (3 Cards in One Clean Row) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Farm Summary
          </h2>
          <span className="text-[11px] text-text-secondary font-medium">
            {loading ? 'Loading statistics...' : 'Operational Overview'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operationalMetrics.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                hoverEffect={true}
                padding="compact"
                className="flex flex-col justify-between border-border/70 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      {stat.title}
                    </span>
                    <span className="text-3xl font-extrabold text-text-primary mt-1.5 tracking-tight">
                      {loading ? '...' : stat.value}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0 border border-border/40`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border/50 text-xs text-text-secondary">
                  <span className="truncate block font-medium">{stat.description}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
