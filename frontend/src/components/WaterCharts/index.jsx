import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Waves, Thermometer, Activity, TrendingUp } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../Card';
import { Button } from '../Button';
import { PH_TREND_DATA, TEMP_TREND_DATA, DO_TREND_DATA } from '../../constants/waterQualityData';

/**
 * Reusable WaterCharts component for Recharts trend analysis:
 * - pH Trend (with 7.5 - 8.5 safe zone)
 * - Temperature Trend (°C)
 * - Dissolved Oxygen Trend (mg/L with 5.0 optimal line)
 */
export const WaterCharts = () => {
  const [activeTab, setActiveTab] = useState('ph'); // ph, temp, do

  return (
    <Card padding="normal" className="border-border/80 bg-surface">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Water Quality Parameter Trends
            </CardTitle>
            <CardDescription>
              Historical 5-day monitoring analysis across active farm ponds.
            </CardDescription>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border shrink-0">
            <Button
              variant={activeTab === 'ph' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ph')}
              icon={<Waves className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              pH Level
            </Button>

            <Button
              variant={activeTab === 'temp' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('temp')}
              icon={<Thermometer className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Temperature
            </Button>

            <Button
              variant={activeTab === 'do' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('do')}
              icon={<Activity className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Dissolved Oxygen
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'ph' ? (
            <LineChart data={PH_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[6.5, 9.5]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine y={7.5} label="Min Safe (7.5)" stroke="#F59E0B" strokeDasharray="3 3" />
              <ReferenceLine y={8.5} label="Max Safe (8.5)" stroke="#F59E0B" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Pond P-1" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Pond P-2" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Pond P-3" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : activeTab === 'temp' ? (
            <LineChart data={TEMP_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[22, 35]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine y={31.0} label="Max Optimal (31°C)" stroke="#EF4444" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Pond P-1" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Pond P-2" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Pond P-3" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : (
            <LineChart data={DO_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[2, 9]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine y={5.0} label="Optimal DO (5.0 mg/L)" stroke="#10B981" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Pond P-1" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Pond P-2" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Pond P-3" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default WaterCharts;
