import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Waves,
  Layers,
  Building2,
  Container,
  UtensilsCrossed,
  Receipt,
  FileText,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { farm: authFarm, isAuthenticated } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getOverview();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();

    const handleFocus = () => {
      loadDashboardData();
    };

    const handleFarmUpdated = () => {
      loadDashboardData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('aquatrack:farm-updated', handleFarmUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('aquatrack:farm-updated', handleFarmUpdated);
      }
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
      description: 'Currently stocking in culture',
      icon: Layers,
      bgColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'harvests',
      title: 'Total Harvest Batches',
      value: stats.totalHarvests ?? 0,
      description: 'Completed yield cycles',
      icon: TrendingUp,
      bgColor: 'bg-cyan-50 text-cyan-700',
    },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader fullPage text="Loading dashboard statistics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER WITH ONBOARDING BANNER IF NO FARM */}
      <PageHeader
        title="Dashboard Overview"
        subtitle={
          farm.farmName
            ? `Centralized operational overview for ${farm.farmName}.`
            : 'Centralized operational overview for prawn farm management.'
        }
      />

      {/* 2. ONBOARDING PROMPT CARD (If farm name not set) */}
      {!hasFarmConfigured && (
        <Card padding="relaxed" className="bg-gradient-to-r from-primary-light/60 to-surface border-primary/30 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-text-primary">Complete Your Farm Setup</h3>
              </div>
              <p className="text-xs text-text-secondary">
                Register your prawn farm details to configure tanks, stocking cycles, and feed monitoring.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/farm-setup')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="shrink-0 font-semibold"
            >
              Start Farm Onboarding
            </Button>
          </div>
        </Card>
      )}

      {/* 3. OPERATIONAL METRICS CARDS (EXACTLY 3 SUMMARY CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {operationalMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} padding="normal" className="border-border/80 hover:border-primary/40 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {metric.title}
                </span>
                <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                  {metric.value}
                </span>
                <p className="text-xs text-text-secondary mt-1 font-medium">
                  {metric.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. QUICK ACTION NAVIGATION TILES */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
          Quick Farm Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            padding="normal"
            className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
            onClick={() => navigate('/tanks')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Container className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                  Tanks & Ponds
                </h4>
                <p className="text-[11px] text-text-secondary">Add and view farm tanks</p>
              </div>
            </div>
          </Card>

          <Card
            padding="normal"
            className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
            onClick={() => navigate('/crops')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                  Crop Management
                </h4>
                <p className="text-[11px] text-text-secondary">Track stocking & culture batches</p>
              </div>
            </div>
          </Card>

          <Card
            padding="normal"
            className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
            onClick={() => navigate('/feed')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                  Feed Rations
                </h4>
                <p className="text-[11px] text-text-secondary">Log daily feed inputs</p>
              </div>
            </div>
          </Card>

          <Card
            padding="normal"
            className="hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
            onClick={() => navigate('/reports')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                  Financial Reports
                </h4>
                <p className="text-[11px] text-text-secondary">View crop cost breakdowns</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
