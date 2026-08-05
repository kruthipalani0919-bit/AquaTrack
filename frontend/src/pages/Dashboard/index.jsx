import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Plus,
  Sprout,
  UtensilsCrossed,
  Waves,
  Receipt,
  Wheat,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Bell,
  Clock
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

import {
  DASHBOARD_STATS,
  EXPENSE_TREND_DATA,
  FEED_CONSUMPTION_DATA,
  RECENT_ACTIVITIES,
  UPCOMING_REMINDERS
} from '../../constants/dashboardData';

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    { label: 'Add Crop', path: '/crops', icon: Sprout, variant: 'primary' },
    { label: 'Add Feed', path: '/feed', icon: UtensilsCrossed, variant: 'secondary' },
    { label: 'Record Water Quality', path: '/water-quality', icon: Waves, variant: 'accent' },
    { label: 'Add Expense', path: '/expenses', icon: Receipt, variant: 'outline' },
    { label: 'Harvest', path: '/harvest', icon: Wheat, variant: 'outline' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. WELCOME BANNER */}
      <div className="relative rounded-2xl bg-gradient-to-r from-teal-900 via-primary to-teal-800 text-white p-6 sm:p-8 shadow-md overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent" size="sm" className="bg-white/20 text-white border-none">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Active Culture Season 2026
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Back, Rajesh!
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
              Here's an overview of today's farm activities, water parameters, and yield projections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/water-quality')}
              icon={<Waves className="w-4 h-4 text-primary" />}
              className="bg-white text-primary hover:bg-teal-50 font-semibold"
            >
              Water Check
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/farm-setup')}
              icon={<Plus className="w-4 h-4" />}
              className="bg-teal-700 hover:bg-teal-600 border border-teal-500"
            >
              Manage Farm
            </Button>
          </div>
        </div>
      </div>

      {/* 2. STATISTICS CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Farm Operational Metrics
          </h2>
          <span className="text-xs text-text-secondary">Updated just now</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {DASHBOARD_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                hoverEffect={true}
                padding="compact"
                className="flex flex-col justify-between border-border/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {stat.title}
                    </span>
                    <span className="text-2xl font-bold text-text-primary mt-1 tracking-tight">
                      {stat.value}
                    </span>
                  </div>

                  <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-secondary truncate max-w-[180px]">
                    {stat.description}
                  </span>
                  <span className="font-semibold text-success flex items-center gap-0.5 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {stat.trend}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. QUICK ACTIONS */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-text-primary mb-3.5 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Quick Actions
        </h2>

        <div className="flex items-center gap-3 overflow-x-auto aqua-scrollbar pb-1">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                variant={action.variant}
                size="sm"
                onClick={() => navigate(action.path)}
                icon={<Icon className="w-4 h-4" />}
                className="shrink-0 font-medium"
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Expense Trend */}
        <Card padding="normal" className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expense Trend Analysis ($)</CardTitle>
              <Badge variant="outline" size="sm">H1 2026</Badge>
            </div>
            <CardDescription>
              Monthly breakdown of feed, electricity power, and chemical costs.
            </CardDescription>
          </CardHeader>

          <CardBody className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={EXPENSE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="feed" name="Feed Cost ($)" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="power" name="Power ($)" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="meds" name="Meds & Chemicals ($)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Chart 2: Feed Consumption Bar Chart */}
        <Card padding="normal" className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feed Distribution by Pond (kg)</CardTitle>
              <Badge variant="primary" size="sm">Active Week</Badge>
            </div>
            <CardDescription>
              Comparison of starter and grower feed consumed across active ponds.
            </CardDescription>
          </CardHeader>

          <CardBody className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEED_CONSUMPTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="pond" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="starterFeed" name="Starter Feed (kg)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="growerFeed" name="Grower Feed (kg)" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* 5. RECENT ACTIVITIES & UPCOMING REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities (2 cols on lg) */}
        <div className="lg:col-span-2">
          <Card padding="normal" className="h-full border-border/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Farm Activities</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                  View Log <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <CardDescription>
                Real-time audit log of operations, water logs, and feeding sessions.
              </CardDescription>
            </CardHeader>

            <CardBody className="space-y-3 mt-2">
              {RECENT_ACTIVITIES.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3.5 p-3 rounded-lg bg-background/60 border border-border/60 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-text-primary truncate">
                          {activity.title}
                        </h4>
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 leading-snug">
                        {activity.details}
                      </p>
                    </div>

                    <Badge variant={activity.badgeVariant} size="sm" className="hidden sm:inline-flex shrink-0">
                      {activity.category}
                    </Badge>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        {/* Upcoming Reminders (1 col on lg) */}
        <div className="lg:col-span-1">
          <Card padding="normal" className="h-full border-border/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-warning" /> Reminders
                </CardTitle>
                <Badge variant="warning" size="sm">{UPCOMING_REMINDERS.length} Pending</Badge>
              </div>
              <CardDescription>
                Scheduled task alerts and maintenance checks.
              </CardDescription>
            </CardHeader>

            <CardBody className="space-y-3 mt-2">
              {UPCOMING_REMINDERS.map((reminder) => {
                const Icon = reminder.icon;
                return (
                  <div
                    key={reminder.id}
                    className="p-3.5 rounded-lg border border-border bg-surface hover:border-primary/30 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-text-primary flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        {reminder.title}
                      </span>
                      <Badge variant={reminder.statusColor} size="sm" className="shrink-0 text-[9px] px-1.5 py-0">
                        {reminder.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-text-secondary leading-snug">
                      {reminder.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium pt-1 border-t border-border/50">
                      <Clock className="w-3 h-3 text-text-secondary shrink-0" />
                      <span>{reminder.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
