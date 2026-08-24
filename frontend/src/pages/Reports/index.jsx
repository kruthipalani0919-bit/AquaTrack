import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  FileText,
  Calendar,
  CalendarDays,
  IndianRupee,
  Layers,
  Container,
  Download,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';

import { useTanks } from '../../context/TankContext';
import { getCropReport, getCompletedCropsByTank, reportService } from '../../services/reportService';

const formatDateDisplay = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return '—';
  }
};

const getDiffDays = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  } catch (e) {
    return null;
  }
};

export default function Reports() {
  const { tanks: contextTanks = [], loading: loadingContextTanks } = useTanks();

  // Tank List & Loading State
  const [reportTanks, setReportTanks] = useState([]);
  const [loadingReportTanks, setLoadingReportTanks] = useState(false);

  // Selected Tank & Report Mode State
  const [selectedTankId, setSelectedTankId] = useState('');
  const [reportType, setReportType] = useState('ACTIVE'); // 'ACTIVE' or 'COMPLETED'
  const [completedCrops, setCompletedCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');

  // Report Data State
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Load tanks from reportService & merge with Context tanks
  useEffect(() => {
    let isMounted = true;
    const loadTanks = async () => {
      setLoadingReportTanks(true);
      try {
        const fetched = await reportService.getReportTanks();
        const list = Array.isArray(fetched) ? fetched : [];
        if (isMounted) {
          setReportTanks(list);
        }
      } catch (err) {
        console.warn('Notice loading report tanks via reportService:', err.message);
      } finally {
        if (isMounted) setLoadingReportTanks(false);
      }
    };

    loadTanks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Effective unified tanks array combining reportTanks and contextTanks
  const effectiveTanks = useMemo(() => {
    const seen = new Set();
    const result = [];

    const combined = [...(reportTanks || []), ...(contextTanks || [])];
    combined.forEach((t) => {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        result.push({
          ...t,
          tankName: t.tankName || t.name || 'Tank',
          name: t.name || t.tankName || 'Tank',
        });
      }
    });

    return result;
  }, [reportTanks, contextTanks]);

  // Default select first tank automatically as soon as effectiveTanks are available
  useEffect(() => {
    if (effectiveTanks.length > 0 && !selectedTankId) {
      setSelectedTankId(effectiveTanks[0].id);
    }
  }, [effectiveTanks, selectedTankId]);

  // Fetch completed crops when selected tank changes
  useEffect(() => {
    let isMounted = true;
    const fetchCompleted = async () => {
      if (!selectedTankId) {
        setCompletedCrops([]);
        setSelectedCropId('');
        return;
      }
      try {
        const res = await getCompletedCropsByTank(selectedTankId);
        const list = res?.data || res || [];
        if (isMounted) {
          setCompletedCrops(Array.isArray(list) ? list : []);
          if (Array.isArray(list) && list.length > 0) {
            setSelectedCropId(list[0].id);
          } else {
            setSelectedCropId('');
          }
        }
      } catch (err) {
        console.error('Error fetching completed crops for tank:', err);
        if (isMounted) setCompletedCrops([]);
      }
    };

    fetchCompleted();
    return () => {
      isMounted = false;
    };
  }, [selectedTankId]);

  // Main Report Fetcher Function
  const fetchReport = useCallback(async () => {
    if (!selectedTankId) return;

    setLoadingReport(true);
    setReportError(null);

    try {
      let data = null;
      if (reportType === 'ACTIVE') {
        const res = await getCropReport(selectedTankId, 'ACTIVE');
        data = res?.data || res;
      } else {
        const targetCropId = selectedCropId || (completedCrops.length > 0 ? completedCrops[0].id : null);
        if (targetCropId) {
          const res = await getCropReport(selectedTankId, 'COMPLETED', targetCropId);
          data = res?.data || res;
        } else {
          data = null;
        }
      }

      setReportData(data);
    } catch (err) {
      console.error('Error fetching crop report:', err);
      setReportError(err.message || 'Failed to load report data');
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  }, [selectedTankId, reportType, selectedCropId, completedCrops]);

  useEffect(() => {
    fetchReport();

    const handleHarvestsChanged = () => {
      fetchReport();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aquatrack:harvests-changed', handleHarvestsChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aquatrack:harvests-changed', handleHarvestsChanged);
      }
    };
  }, [fetchReport]);

  // Clean Tank Options
  const tankOptions = useMemo(() => {
    return effectiveTanks.map((tank) => {
      const rawName = tank.name || tank.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      const area = parseFloat(tank.area);
      const details = !isNaN(area) && area > 0 ? `${area} Acres` : '';

      return {
        value: tank.id,
        label: details ? `${cleanName} (${details})` : cleanName,
      };
    });
  }, [effectiveTanks]);

  const summary = reportData?.summary || {};
  const crop = reportData?.crop || {};
  const tank = reportData?.tank || {};
  const feedHistory = reportData?.feedHistory || [];
  const medicineHistory = reportData?.medicineHistory || [];
  const expenseHistory = reportData?.expenseHistory || [];

  const rawCropTankName = tank.tankName || tank.name || 'Pond';
  const displayCropTankName = rawCropTankName.replace(/\s*\([^)]*\)/g, '').trim() || rawCropTankName;

  // Resolve Harvest Date
  const resolvedHarvestDate = crop.harvestDate || crop.expectedHarvestDate || null;

  // DAY OF CULTURE CALCULATIONS (No. of days taken to harvest the crop)
  const computedDoc = useMemo(() => {
    if (!crop.stockingDate) return null;

    if (crop.status === 'COMPLETED' || reportType === 'COMPLETED') {
      const targetHarvestDate = resolvedHarvestDate || new Date().toISOString().split('T')[0];
      const calcDays = getDiffDays(crop.stockingDate, targetHarvestDate);
      if (calcDays !== null) return calcDays;
    } else {
      const calcDays = getDiffDays(crop.stockingDate, new Date().toISOString().split('T')[0]);
      if (calcDays !== null) return calcDays;
    }

    return crop.doc || crop.dayOfCulture || null;
  }, [crop, resolvedHarvestDate, reportType]);

  // SINGLE UNIFIED CALCULATED DATASET FOR CARDS, CHART & TABLE
  // Calculates Pond Lease Cost dynamically based on no. of days taken to harvest the crop (computedDoc)
  const categoriesData = useMemo(() => {
    const feedCost = Number(summary.totalFeedCost) || 0;
    const medicineCost = Number(summary.totalMedicineCost) || 0;

    const docDays = computedDoc !== null && !isNaN(Number(computedDoc)) && Number(computedDoc) > 0 ? Number(computedDoc) : 1;

    // Calculate Pond Lease Cost for this crop batch based on DOC days
    let computedPondLeaseCost = 0;
    const activeLease = reportData?.tankLease;

    if (activeLease) {
      const dailyCost = Number(activeLease.dailyLeaseCost) ||
        (activeLease.totalLeaseAmount && activeLease.totalLeaseDays ? (Number(activeLease.totalLeaseAmount) / Number(activeLease.totalLeaseDays)) : 0);

      if (dailyCost > 0) {
        computedPondLeaseCost = Math.round((dailyCost * docDays) * 100) / 100;
      }
    }

    if (computedPondLeaseCost <= 0) {
      const rawBackendLease = Number(summary.totalPondLeaseCost) || 0;
      if (rawBackendLease > 0) {
        computedPondLeaseCost = docDays > 1 && rawBackendLease < 10000
          ? Math.round((rawBackendLease * docDays) * 100) / 100
          : rawBackendLease;
      }
    }

    const pondLeaseCost = computedPondLeaseCost;

    // Collect individual expenses from expenseHistory with exact names
    const individualExpenses = (expenseHistory || []).map((exp) => {
      const name = exp.title || exp.name || exp.category || exp.remarks || 'General Expense';
      const amount = Number(exp.amount) || 0;
      return { category: name, amount };
    });

    let otherExpenseCost = 0;
    if (individualExpenses.length > 0) {
      otherExpenseCost = individualExpenses.reduce((sum, item) => sum + item.amount, 0);
    } else {
      otherExpenseCost = Number(summary.totalExpenseCost) || 0;
    }

    const totalExpenditure = feedCost + medicineCost + pondLeaseCost + otherExpenseCost;

    // List for PieChart and Cost Distribution Table
    const list = [
      { category: 'Feed', amount: feedCost },
      { category: 'Medicine', amount: medicineCost },
      { category: 'Pond Lease', amount: pondLeaseCost },
      ...(individualExpenses.length > 0
        ? individualExpenses
        : (otherExpenseCost > 0 ? [{ category: 'Other Expenses', amount: otherExpenseCost }] : [])),
    ];

    return {
      list,
      totalExpenditure: totalExpenditure || Number(summary.totalExpenses) || 0,
      feedCost,
      medicineCost,
      pondLeaseCost,
      otherExpenseCost,
    };
  }, [summary, expenseHistory, computedDoc, reportData?.tankLease]);

  // PIE CHART DATA DISTRIBUTION IN EXACT INDIVIDUAL ITEM ORDER
  const pieChartData = useMemo(() => {
    const palette = ['#f59e0b', '#0d9488', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

    const data = categoriesData.list
      .filter((item) => item.amount > 0)
      .map((item, index) => ({
        name: item.category,
        value: item.amount,
        color: palette[index % palette.length],
      }));

    return data;
  }, [categoriesData]);

  // EXPORT COMPLETE REPORT HANDLER (Generates and downloads full report)
  const handleExportReport = () => {
    if (!reportData) return;

    const tankNameStr = displayCropTankName || 'Tank';
    const batchNameStr = crop.cropName || crop.batchNumber || 'CropBatch';
    const cleanTankName = tankNameStr.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanBatchName = String(batchNameStr).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `AquaTrack_Report_${cleanTankName}_${cleanBatchName}.html`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AquaTrack Complete Report - ${tankNameStr} (${batchNameStr})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 35px; color: #0f172a; background: #fff; line-height: 1.5; }
    .header { border-bottom: 3px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 24px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .meta-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 28px; margin-bottom: 12px; border-left: 4px solid #0d9488; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid { display: grid; grid-template-cols: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .card-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .card-highlight { background: #ccfbf1; border-color: #99f6e4; }
    .card-highlight .card-label { color: #0f766e; }
    .card-highlight .card-value { color: #0f766e; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; text-align: left; padding: 9px 12px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
    td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .total-row { font-weight: 800; background: #f0fdf4; color: #166534; border-top: 2px solid #bbf7d0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">AquaTrack — Complete Farm Report</div>
      <div class="subtitle">Detailed crop & financial analysis for ${tankNameStr}</div>
    </div>
    <div class="meta-tag">Exported on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
  </div>

  <!-- A. BATCH & TANK INFORMATION -->
  <div class="section-title">A. Report & Batch Details</div>
  <div style="display: grid; grid-template-cols: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
    <div class="card">
      <div class="card-label">Tank / Pond</div>
      <div class="card-value">${displayCropTankName} ${tank.area ? `(${tank.area} Acres)` : ''}</div>
    </div>
    <div class="card">
      <div class="card-label">Batch Name</div>
      <div class="card-value">${crop.cropName || crop.batchNumber || 'Crop Batch'}</div>
    </div>
    <div class="card">
      <div class="card-label">Batch Status</div>
      <div class="card-value">${crop.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'}</div>
    </div>
    <div class="card">
      <div class="card-label">Day of Culture</div>
      <div class="card-value">${computedDoc !== null ? `Day ${computedDoc}` : '—'}</div>
    </div>
  </div>

  <div style="display: grid; grid-template-cols: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
    <div class="card">
      <div class="card-label">Stocking Date</div>
      <div class="card-value">${crop.stockingDate ? formatDateDisplay(crop.stockingDate) : '—'}</div>
    </div>
    <div class="card">
      <div class="card-label">Harvest Date</div>
      <div class="card-value">${resolvedHarvestDate ? formatDateDisplay(resolvedHarvestDate) : '—'}</div>
    </div>
  </div>

  <!-- B. COST SUMMARY -->
  <div class="section-title">B. Cost Summary</div>
  <div class="grid">
    <div class="card">
      <div class="card-label">Total Feed Cost</div>
      <div class="card-value">₹${categoriesData.feedCost.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-label">Medicine Cost</div>
      <div class="card-value">₹${categoriesData.medicineCost.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-label">Pond Lease Cost</div>
      <div class="card-value">₹${categoriesData.pondLeaseCost.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-label">Other Expenses</div>
      <div class="card-value">₹${categoriesData.otherExpenseCost.toLocaleString()}</div>
    </div>
    <div class="card card-highlight">
      <div class="card-label">Total Batch Cost</div>
      <div class="card-value">₹${categoriesData.totalExpenditure.toLocaleString()}</div>
    </div>
  </div>

  <!-- C. COST DISTRIBUTION BREAKDOWN -->
  <div class="section-title">C. Cost Distribution Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Expense Category</th>
        <th class="text-right">Amount (₹)</th>
        <th class="text-right">Cost Share (%)</th>
      </tr>
    </thead>
    <tbody>
      ${categoriesData.list.map(c => {
        const pct = categoriesData.totalExpenditure > 0 ? ((c.amount / categoriesData.totalExpenditure) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td class="font-bold">${c.category}</td>
            <td class="text-right font-bold">₹${c.amount.toLocaleString()}</td>
            <td class="text-right">${pct}%</td>
          </tr>
        `;
      }).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td>Total Batch Expenditure</td>
        <td class="text-right">₹${categoriesData.totalExpenditure.toLocaleString()}</td>
        <td class="text-right">100%</td>
      </tr>
    </tfoot>
  </table>

  <!-- D. FEEDING RECORDS -->
  <div class="section-title">D. Feeding Records (${feedHistory.length})</div>
  ${feedHistory.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Feed Name</th>
          <th class="text-right">Cost (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${feedHistory.map(f => `
          <tr>
            <td class="font-bold">${f.feedName || f.feedType || 'Feed'}</td>
            <td class="text-right font-bold">₹${(Number(f.totalCost || f.cost) || 0).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="color:#64748b; font-size:12px; margin-top:6px;">No feeding logs recorded for this batch.</p>'}

  <!-- E. MEDICINE RECORDS -->
  <div class="section-title">E. Medicine Records (${medicineHistory.length})</div>
  ${medicineHistory.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Medicine Name</th>
          <th class="text-right">Cost (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${medicineHistory.map(m => `
          <tr>
            <td class="font-bold">${m.medicineName || m.name || 'Medicine'}</td>
            <td class="text-right font-bold">₹${(Number(m.totalCost || m.cost) || 0).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="color:#64748b; font-size:12px; margin-top:6px;">No medicine logs recorded for this batch.</p>'}

  <!-- F. OTHER EXPENSES LOGS -->
  <div class="section-title">F. Other Expenses Logs (${expenseHistory.length})</div>
  ${expenseHistory.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Expense Name</th>
          <th class="text-right">Cost (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${expenseHistory.map(exp => `
          <tr>
            <td class="font-bold">${exp.title || exp.name || exp.category || exp.remarks || 'Expense'}</td>
            <td class="text-right font-bold">₹${(Number(exp.amount) || 0).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="color:#64748b; font-size:12px; margin-top:6px;">No other expenses logged for this batch.</p>'}

  <div class="footer">
    AquaTrack Farm Management System — Complete Report &bull; Confidentially Generated
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isTanksLoading = loadingContextTanks || loadingReportTanks;

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Crop & Financial Reports"
        subtitle="Detailed cost breakdown, feeding records, medicine logs, and tank profitability."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={!reportData}
              icon={<Download className="w-4 h-4" />}
              className="font-semibold shadow-xs cursor-pointer"
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* 2. FILTER SECTION */}
      <Card padding="normal" className="border-border/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Select Tank Dropdown */}
          <div className="flex-1 max-w-md">
            <Select
              label="Select Tank"
              placeholder={isTanksLoading ? "Loading tanks..." : effectiveTanks.length === 0 ? "No tanks available" : "Choose tank..."}
              options={tankOptions}
              value={selectedTankId}
              onChange={(e) => {
                setSelectedTankId(e.target.value);
                setReportType('ACTIVE');
              }}
              disabled={isTanksLoading || effectiveTanks.length === 0}
            />
          </div>

          {/* Batch Status Segment Buttons */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-text-secondary">Batch Status</span>
            <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-border">
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
          </div>
        </div>
      </Card>

      {/* 3. REPORT DATA DISPLAY OR EMPTY STATE */}
      {loadingReport ? (
        <div className="py-16 text-center bg-surface border border-border/80 rounded-2xl shadow-2xs">
          <Loader text="Fetching report statistics..." />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* SELECTED BATCH TIMELINE BAR */}
          <div className="bg-surface border border-border/80 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={crop.status === 'ACTIVE' ? 'primary' : 'success'} size="sm">
                  {crop.status === 'ACTIVE' ? 'Active Batch' : 'Completed Batch'}
                </Badge>
                <h3 className="font-extrabold text-base text-text-primary">
                  {crop.cropName || crop.batchNumber ? `Batch ${crop.cropName || crop.batchNumber}` : `Crop Batch for ${displayCropTankName}`}
                </h3>
              </div>
              <p className="text-xs text-text-secondary flex items-center gap-1.5">
                <Container className="w-3.5 h-3.5 text-primary" /> {displayCropTankName}
                {tank.area && ` (${tank.area} Acres)`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-background p-3 rounded-xl border border-border/60">
              {/* STOCKING DATE */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> Stocking Date
                </span>
                <span className="font-bold text-text-primary block">
                  {crop.stockingDate ? formatDateDisplay(crop.stockingDate) : '—'}
                </span>
              </div>

              {/* HARVEST DATE */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-emerald-600" /> Harvest Date
                </span>
                <span className="font-bold text-text-primary block">
                  {resolvedHarvestDate ? formatDateDisplay(resolvedHarvestDate) : '—'}
                </span>
              </div>

              {/* DAY OF CULTURE */}
              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-500" /> Day of Culture
                </span>
                <span className="font-bold text-primary block">
                  {computedDoc !== null ? `Day ${computedDoc}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY CARDS (5 Cards in exact order) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Total Feed Cost */}
            <Card padding="compact" className="border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block truncate">Total Feed Cost</span>
                  <span className="text-base font-extrabold text-text-primary tracking-tight">₹{categoriesData.feedCost.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* 2. Medicine Cost */}
            <Card padding="compact" className="border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block truncate">Medicine Cost</span>
                  <span className="text-base font-extrabold text-text-primary tracking-tight">₹{categoriesData.medicineCost.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* 3. Pond Lease Cost (Calculated based on no. of days taken to harvest) */}
            <Card padding="compact" className="border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block truncate">Pond Lease Cost</span>
                  <span className="text-base font-extrabold text-text-primary tracking-tight">₹{categoriesData.pondLeaseCost.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* 4. Other Expenses */}
            <Card padding="compact" className="border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block truncate">Other Expenses</span>
                  <span className="text-base font-extrabold text-text-primary tracking-tight">₹{categoriesData.otherExpenseCost.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* 5. Total Batch Cost */}
            <Card padding="compact" className="border-border/80 bg-primary-light/20 border-primary/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-primary tracking-wider block truncate">Total Batch Cost</span>
                  <span className="text-base font-extrabold text-primary tracking-tight">₹{categoriesData.totalExpenditure.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* COST DISTRIBUTION GRID: PIE CHART & CATEGORY TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RESTORED COST DISTRIBUTION PIE CHART */}
            <Card padding="normal" className="border-border/80 shadow-2xs flex flex-col">
              <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Cost Distribution Chart
              </h4>
              <div className="w-full h-64 flex-1 flex items-center justify-center min-h-[260px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Cost']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-semibold text-text-primary">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-text-secondary text-xs">
                    <AlertCircle className="w-6 h-6 text-text-secondary mx-auto mb-1 opacity-50" />
                    No cost allocation logged for this batch yet.
                  </div>
                )}
              </div>
            </Card>

            {/* EXPENSE CATEGORY BREAKDOWN TABLE */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Cost Distribution by Category
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-background/80 text-text-secondary font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Expense Category</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 text-right">Cost Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {categoriesData.list.map((cat, idx) => {
                      const pct = categoriesData.totalExpenditure > 0 ? ((cat.amount / categoriesData.totalExpenditure) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={idx} className="hover:bg-background/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-text-primary">{cat.category}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-text-primary">₹{cat.amount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right text-text-secondary font-medium">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-primary-light/20 font-bold text-primary">
                      <td className="py-3 px-3">Total Batch Expenditure</td>
                      <td className="py-3 px-3 text-right text-sm">₹{categoriesData.totalExpenditure.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>

          {/* FEED, MEDICINE & OTHER EXPENSES LOGS SUMMARY TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Recent Feeding Logs */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" /> Recent Feeding Logs ({feedHistory.length})
              </h4>
              {feedHistory.length > 0 ? (
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface border-b border-border/80 text-text-secondary font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Feed Name</th>
                        <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {feedHistory.map((item, i) => (
                        <tr key={i} className="hover:bg-background/50">
                          <td className="py-2.5 px-3 font-medium text-text-primary">{item.feedName || item.feedType || 'Feed'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-text-primary">₹{(Number(item.totalCost || item.cost) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-4 text-center">No feeding logs recorded for this batch.</p>
              )}
            </Card>

            {/* 2. Recent Medicine Logs */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Recent Medicine Logs ({medicineHistory.length})
              </h4>
              {medicineHistory.length > 0 ? (
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface border-b border-border/80 text-text-secondary font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {medicineHistory.map((item, i) => (
                        <tr key={i} className="hover:bg-background/50">
                          <td className="py-2.5 px-3 font-medium text-text-primary">{item.medicineName || item.name || 'Medicine'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-text-primary">₹{(Number(item.totalCost || item.cost) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-4 text-center">No medicine logs recorded for this batch.</p>
              )}
            </Card>

            {/* 3. Other Expenses Logs */}
            <Card padding="normal" className="border-border/80 shadow-2xs">
              <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" /> Other Expenses Logs ({expenseHistory.length})
              </h4>
              {expenseHistory.length > 0 ? (
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface border-b border-border/80 text-text-secondary font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Expense Name</th>
                        <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {expenseHistory.map((item, i) => (
                        <tr key={i} className="hover:bg-background/50">
                          <td className="py-2.5 px-3 font-medium text-text-primary">
                            {item.title || item.name || item.category || item.remarks || 'Expense'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-text-primary">
                            ₹{(Number(item.amount) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-4 text-center">No other expenses logged for this batch.</p>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 text-center py-12">
          <AlertCircle className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold text-text-primary mb-1">No Report Data Available</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {reportError || "Select a tank and batch status to view financial reports and crop logs."}
          </p>
        </Card>
      )}
    </div>
  );
}
