import React from 'react';
import { FileText, TrendingUp, DollarSign, Utensils, Stethoscope, Wheat, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useExpenses } from '../../context/ExpenseContext';
import { useFeed } from '../../context/FeedContext';
import { useMedicine } from '../../context/MedicineContext';
import { useHarvests } from '../../context/HarvestContext';
import { useTanks } from '../../context/TankContext';

export default function Reports() {
  const { expenses = [] } = useExpenses();
  const { feedLogs = [] } = useFeed();
  const { medicineRecords = [] } = useMedicine();
  const { harvests = [] } = useHarvests();
  const { tanks = [] } = useTanks();

  const totalExpense = expenses.reduce((acc, e) => acc + (parseFloat(e?.amount) || 0), 0);
  const totalFeedKg = feedLogs.reduce((acc, f) => acc + (parseFloat(f?.quantityKg) || 0), 0);
  const totalMedicineCost = medicineRecords.reduce((acc, m) => acc + (parseFloat(m?.cost) || 0), 0);
  const totalHarvestProduction = harvests.reduce((acc, h) => acc + (parseFloat(h?.production) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farm Analytics & Reports"
        subtitle="Comprehensive operational reports, expense summaries, feed conversion metrics, and yield reports."
        badge={<Badge variant="primary">Real-time Data</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Download className="w-4 h-4" />}
          >
            Export Summary
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="normal" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase">Total Expenditure</span>
              <h3 className="text-xl font-bold text-text-primary">₹{totalExpense.toLocaleString()}</h3>
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase">Total Feed Used</span>
              <h3 className="text-xl font-bold text-text-primary">{totalFeedKg.toLocaleString()} kg</h3>
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase">Health & Medicine</span>
              <h3 className="text-xl font-bold text-text-primary">₹{totalMedicineCost.toLocaleString()}</h3>
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase">Harvest Yield</span>
              <h3 className="text-xl font-bold text-text-primary">{totalHarvestProduction.toLocaleString()} kg</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="relaxed" className="border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Operational Summary
            </h3>
            <Badge variant="neutral">{tanks.length} Tanks Registered</Badge>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span>Total Active Tanks:</span>
              <span className="font-semibold text-text-primary">{tanks.filter(t => t.status === 'Active').length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span>Total Feeding Logs:</span>
              <span className="font-semibold text-text-primary">{feedLogs.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span>Total Medicine Treatments:</span>
              <span className="font-semibold text-text-primary">{medicineRecords.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Total Expense Records:</span>
              <span className="font-semibold text-text-primary">{expenses.length}</span>
            </div>
          </div>
        </Card>

        <Card padding="relaxed" className="border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Yield & Performance Overview
            </h3>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span>Completed Harvests:</span>
              <span className="font-semibold text-text-primary">{harvests.length} Batches</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span>Total Production:</span>
              <span className="font-semibold text-text-primary">{totalHarvestProduction.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Farm Efficiency Status:</span>
              <span className="font-semibold text-emerald-600">Optimal</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
