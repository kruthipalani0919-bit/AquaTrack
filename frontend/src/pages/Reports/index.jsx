import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart as PieChartIcon,
  Utensils,
  Stethoscope,
  Receipt,
  DollarSign,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';

import reportService from '../../services/reportService';

const CHART_COLORS = [
  '#0F766E', // Teal
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#3B82F6'  // Blue
];

export default function Reports() {
  const [tanks, setTanks] = useState([]);
  const [selectedTankId, setSelectedTankId] = useState('');
  const [reportType, setReportType] = useState('ACTIVE'); // 'ACTIVE' or 'COMPLETED'
  const [completedCrops, setCompletedCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loadingTanks, setLoadingTanks] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // 1. Fetch Tanks list on initial mount
  const fetchTanks = useCallback(async () => {
    try {
      setLoadingTanks(true);
      setInfoMsg('');
      const tankList = await reportService.getReportTanks();
      setTanks(tankList);

      if (tankList && tankList.length > 0) {
        setSelectedTankId(tankList[0].id);
      }
    } catch (err) {
      console.error('Error fetching tanks for reports:', err);
      setTanks([]);
      setInfoMsg('Please create your farm profile and setup tanks to view reports.');
    } finally {
      setLoadingTanks(false);
    }
  }, []);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  // 2. Fetch Report Data for Selected Tank & Batch Type
  const loadReport = useCallback(async () => {
    if (!selectedTankId) {
      setReportData(null);
      return;
    }

    try {
      setLoadingReport(true);
      setInfoMsg('');

      if (reportType === 'ACTIVE') {
        const res = await reportService.getActiveTankReport(selectedTankId);
        setReportData(res.data || res);
      } else if (reportType === 'COMPLETED' && selectedCropId) {
        const res = await reportService.getCompletedCropReport(selectedCropId);
        setReportData(res.data || res);
      }
    } catch (err) {
      console.log('Report fetch info:', err.message);
      setReportData(null);
      setInfoMsg(err.message || 'No report data available for this selection.');
    } finally {
      setLoadingReport(false);
    }
  }, [selectedTankId, reportType, selectedCropId]);

  // 3. Fetch Completed Crops List when tank changes
  useEffect(() => {
    async function fetchCompletedList() {
      if (!selectedTankId) return;
      try {
        const list = await reportService.getCompletedCrops(selectedTankId);
        setCompletedCrops(list);
        if (list && list.length > 0) {
          setSelectedCropId(list[0].id);
        } else {
          setSelectedCropId('');
        }
      } catch {
        setCompletedCrops([]);
        setSelectedCropId('');
      }
    }

    fetchCompletedList();
  }, [selectedTankId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const tankOptions = tanks.map((tank) => {
    const name = tank.tankName || tank.name || 'Pond';
    const details = tank.area ? `${tank.area} Acres` : '';
    return {
      value: tank.id,
      label: details ? `${name} (${details})` : name,
    };
  });

  const completedCropOptions = completedCrops.map((crop) => ({
    value: crop.id,
    label: `${crop.cropName} (${new Date(crop.stockingDate).toLocaleDateString()})`,
  }));

  const summary = reportData?.summary || {};
  const crop = reportData?.crop || {};
  const tank = reportData?.tank || {};
  const expenseBreakdown = reportData?.expenseBreakdown || [];
  const feedHistory = reportData?.feedHistory || [];
  const medicineHistory = reportData?.medicineHistory || [];
  const expenseHistory = reportData?.expenseHistory || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Farm Analytics & Reports"
        subtitle="Comprehensive operational reports, cost breakdowns, feed usage logs, and financial metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadReport}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              icon={<Download className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* 2. REPORT CONTROLS (Tank & Batch Selection) */}
      <Card padding="relaxed" className="border-border/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
          {/* Tank Selector */}
          <div className="flex-1">
            <Select
              label="Select Pond / Tank"
              placeholder={loadingTanks ? "Loading tanks..." : "Choose pond/tank..."}
              options={tankOptions}
              value={selectedTankId}
              onChange={(e) => {
                setSelectedTankId(e.target.value);
                setReportType('ACTIVE');
              }}
              disabled={loadingTanks || tanks.length === 0}
            />
          </div>

          {/* Report Mode Switcher (Active vs Completed) */}
          <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-border shrink-0">
            <button
              type="button"
              onClick={() => setReportType('ACTIVE')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                reportType === 'ACTIVE'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Active Crop Batch
            </button>
            <button
              type="button"
              disabled={completedCrops.length === 0}
              onClick={() => setReportType('COMPLETED')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                reportType === 'COMPLETED'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary disabled:opacity-40 cursor-pointer'
              }`}
            >
              Completed Batches ({completedCrops.length})
            </button>
          </div>

          {/* Completed Crop Selector (if mode is COMPLETED) */}
          {reportType === 'COMPLETED' && completedCrops.length > 0 && (
            <div className="flex-1">
              <Select
                label="Select Completed Batch"
                placeholder="Choose batch..."
                options={completedCropOptions}
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* 3. REPORT DATA DISPLAY OR FRIENDLY EMPTY STATE */}
      {loadingReport ? (
        <div className="py-16 text-center bg-surface border border-border/80 rounded-2xl shadow-2xs">
          <Loader text="Fetching report statistics..." />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* CROP & TANK METADATA HEADER */}
          <div className="bg-surface border border-border/80 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={crop.status === 'ACTIVE' ? 'primary' : 'neutral'} size="sm">
                  {crop.status || 'Active'} Batch
                </Badge>
                <span className="text-xs text-text-secondary font-medium">{tank.tankName} ({tank.area} Acres)</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{crop.cropName}</h2>
            </div>

            <div className="flex items-center gap-6 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-text-secondary">Stocked</span>
                  <span className="font-bold text-text-primary">{crop.stockingDate ? new Date(crop.stockingDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-text-secondary">Day of Culture</span>
                  <span className="font-bold text-text-primary">Day {crop.currentDay ?? 'N/A'} / {crop.cropDuration || 120}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 LIVE SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="compact" className="border-border/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Cost</span>
                  <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">₹{(summary.totalFeedCost || 0).toLocaleString()}</h3>
                </div>
              </div>
            </Card>

            <Card padding="compact" className="border-border/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-text-secondary tracking-wider block">Total Medicine Cost</span>
                  <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">₹{(summary.totalMedicineCost || 0).toLocaleString()}</h3>
                </div>
              </div>
            </Card>

            <Card padding="compact" className="border-border/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-text-secondary tracking-wider block">Other Expenses</span>
                  <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">₹{(summary.totalExpenseCost || 0).toLocaleString()}</h3>
                </div>
              </div>
            </Card>

            <Card padding="compact" className="border-border/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-text-secondary tracking-wider block">Total Expenditure</span>
                  <h3 className="text-2xl font-extrabold text-primary mt-0.5">₹{(summary.totalExpenses || 0).toLocaleString()}</h3>
                </div>
              </div>
            </Card>
          </div>

          {/* REAL PIE CHART SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card padding="normal" className="lg:col-span-1 border-border/80 shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-primary" /> Expense Category Breakdown
                </CardTitle>
                <CardDescription>Visual distribution of feed, medicine, and farm expenses</CardDescription>
              </CardHeader>
              <CardBody className="h-72 w-full pt-2 flex items-center justify-center">
                {expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-text-secondary">No expense breakdown data recorded.</div>
                )}
              </CardBody>
            </Card>

            {/* EXPENSE BREAKDOWN LIST TABLE */}
            <Card padding="normal" className="lg:col-span-2 border-border/80 shadow-2xs">
              <CardHeader>
                <CardTitle>Expense Category Totals</CardTitle>
                <CardDescription>Detailed aggregated totals returned by the backend</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-background text-text-secondary uppercase font-semibold border-b border-border">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Total Amount (₹)</th>
                        <th className="p-3">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {expenseBreakdown.map((item, idx) => {
                        const total = summary.totalExpenses || 1;
                        const percentage = ((item.amount / total) * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-background/40">
                            <td className="p-3 font-semibold text-text-primary flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                              />
                              {item.category}
                            </td>
                            <td className="p-3 font-bold text-text-primary">₹{item.amount.toLocaleString()}</td>
                            <td className="p-3 text-text-secondary font-medium">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* HISTORICAL DETAILED LOGS (Feed, Medicine, Expense) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feed History */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm">Feed History Logs ({feedHistory.length})</CardTitle>
              </CardHeader>
              <CardBody className="max-h-64 overflow-y-auto aqua-scrollbar">
                {feedHistory.length > 0 ? (
                  <div className="space-y-2">
                    {feedHistory.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-background border border-border/60 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-text-primary block">{item.feedType} ({item.feedBrand})</span>
                          <span className="text-[10px] text-text-secondary">{new Date(item.date).toLocaleDateString()} - {item.quantity} kg</span>
                        </div>
                        <span className="font-bold text-primary">₹{item.totalCost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary py-4 text-center">No feed entries logged.</div>
                )}
              </CardBody>
            </Card>

            {/* Medicine History */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm">Medicine Records ({medicineHistory.length})</CardTitle>
              </CardHeader>
              <CardBody className="max-h-64 overflow-y-auto aqua-scrollbar">
                {medicineHistory.length > 0 ? (
                  <div className="space-y-2">
                    {medicineHistory.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-background border border-border/60 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-text-primary block">{item.medicineName}</span>
                          <span className="text-[10px] text-text-secondary">{new Date(item.date).toLocaleDateString()} - {item.purpose}</span>
                        </div>
                        <span className="font-bold text-indigo-700">₹{item.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary py-4 text-center">No medicine records logged.</div>
                )}
              </CardBody>
            </Card>

            {/* Expense History */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm">Expense Log ({expenseHistory.length})</CardTitle>
              </CardHeader>
              <CardBody className="max-h-64 overflow-y-auto aqua-scrollbar">
                {expenseHistory.length > 0 ? (
                  <div className="space-y-2">
                    {expenseHistory.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-background border border-border/60 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-text-primary block">{item.category}</span>
                          <span className="text-[10px] text-text-secondary">{new Date(item.date).toLocaleDateString()} - {item.paymentMode}</span>
                        </div>
                        <span className="font-bold text-amber-700">₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary py-4 text-center">No general expenses logged.</div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Report Data Available"
            description={
              tanks.length === 0
                ? "You haven't configured any tanks or farm ponds yet. Add your tanks first to view reports."
                : (infoMsg.includes('active crop')
                    ? "No active crop batch found for the selected tank. Switch to Completed Batches or register a crop batch in Crop Management."
                    : infoMsg || "Select a tank above to generate reports.")
            }
            actionLabel={tanks.length === 0 ? "Setup Tanks" : "Go to Crop Management"}
            onAction={() => (window.location.href = tanks.length === 0 ? '/tanks' : '/crops')}
          />
        </Card>
      )}
    </div>
  );
}
