import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Wallet, CalendarDays, TrendingUp, MapPin } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const PIE_COLORS = ['#525EA7', '#FFC349', '#5FACD3', '#97DDE9'];

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const BREAKDOWN_ICONS = {
  transport: '✈️',
  stay: '🏨',
  meals: '🍽️',
  activities: '🎯',
};

export default function Budget() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(`/trips/${tripId}/budget`, { token })
      .then(setBudget)
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!budget) return null;

  const pieData = Object.entries(budget.breakdown).map(([name, value]) => ({ name, value }));
  const barData = budget.perStop.map((s) => ({
    city: s.city,
    Transport: s.transport,
    Stay: s.stay,
    Meals: s.meals,
    Activities: s.activities,
    total: s.total,
  }));

  const usedPercent = budget.totalBudget
    ? Math.min((budget.total / budget.totalBudget) * 100, 100)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link to={`/trips/${tripId}/builder`} className="hover:text-primary transition-colors">
              ← Back to Itinerary Builder
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trip Budget</h1>
          <p className="text-muted-foreground text-sm mt-1">Estimated cost breakdown for this trip.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/trips/${tripId}`}>👁 View Itinerary</Link>
        </Button>
      </div>

      {budget.overBudget && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          <AlertTriangle className="size-5 flex-shrink-0" />
          <span>Over budget! Estimated <strong>${budget.total}</strong> exceeds your <strong>${budget.totalBudget}</strong> limit by <strong>${(budget.total - budget.totalBudget).toFixed(2)}</strong>.</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-1"><Wallet className="size-5 text-primary" /></div>
          <p className="text-2xl font-bold">${budget.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Estimated</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-1"><TrendingUp className="size-5 text-primary" /></div>
          <p className="text-2xl font-bold">${budget.averagePerDay}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Avg per Day</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-1"><CalendarDays className="size-5 text-primary" /></div>
          <p className="text-2xl font-bold">{budget.totalDays}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Days</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-1"><MapPin className="size-5 text-primary" /></div>
          <p className="text-2xl font-bold">{budget.totalBudget ? `$${budget.totalBudget}` : budget.perStop.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{budget.totalBudget ? 'Budget Limit' : 'City Stops'}</p>
        </Card>
      </div>

      {/* Progress Bar if budget limit set */}
      {usedPercent !== null && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
            <span>Budget used: {usedPercent.toFixed(1)}%</span>
            <span>${budget.total} / ${budget.totalBudget}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budget.overBudget ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(budget.breakdown).map(([key, val]) => (
          <Card key={key} className="p-4 text-center">
            <div className="text-2xl mb-1">{BREAKDOWN_ICONS[key]}</div>
            <p className="text-xl font-bold">${val}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{key}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Cost Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  labelLine={false}
                  label={CustomLabel}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, '']} />
                <Legend formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cost per Stop</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v}`, '']} />
                <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                <Bar dataKey="Transport" stackId="a" fill="#525EA7" />
                <Bar dataKey="Stay" stackId="a" fill="#FFC349" />
                <Bar dataKey="Meals" stackId="a" fill="#5FACD3" />
                <Bar dataKey="Activities" stackId="a" fill="#97DDE9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Per-stop breakdown table */}
      {budget.perStop.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Breakdown by Stop</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    {['City', 'Days', 'Transport', 'Stay', 'Meals', 'Activities', 'Total'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {budget.perStop.map((s) => (
                    <tr key={s.stopId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3 font-medium">{s.city}</td>
                      <td className="px-6 py-3 text-muted-foreground">{s.days}</td>
                      <td className="px-6 py-3">${s.transport}</td>
                      <td className="px-6 py-3">${s.stay}</td>
                      <td className="px-6 py-3">${s.meals}</td>
                      <td className="px-6 py-3">${s.activities}</td>
                      <td className="px-6 py-3 font-bold text-primary">${s.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/60">
                    <td className="px-6 py-3 font-bold" colSpan={6}>Grand Total</td>
                    <td className="px-6 py-3 font-bold text-primary text-base">${budget.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
