import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Wallet, CalendarDays, TrendingUp } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Matches the --chart-1..4 tokens in index.css
const COLORS = ['#ffc349', '#525ea7', '#5facd3', '#97dde9'];

export default function Budget() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [budget, setBudget] = useState(null);

  useEffect(() => { request(`/trips/${tripId}/budget`, { token }).then(setBudget); }, [tripId]);

  if (!budget) return <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8"><Skeleton className="h-64 w-full" /></div>;

  const pieData = Object.entries(budget.breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageHeader title="Trip Budget" description="Estimated cost breakdown for this trip." />

      {budget.overBudget && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4" /> Over budget! Total ${budget.total} exceeds your ${budget.totalBudget} limit.
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="items-center gap-1 p-4 text-center">
          <Wallet className="size-5 text-primary" />
          <p className="text-2xl font-semibold">${budget.total}</p>
          <p className="text-xs text-muted-foreground">Total estimated cost</p>
        </Card>
        <Card className="items-center gap-1 p-4 text-center">
          <TrendingUp className="size-5 text-primary" />
          <p className="text-2xl font-semibold">${budget.averagePerDay}</p>
          <p className="text-xs text-muted-foreground">Average per day</p>
        </Card>
        <Card className="items-center gap-1 p-4 text-center">
          <CalendarDays className="size-5 text-primary" />
          <p className="text-2xl font-semibold">{budget.totalDays}</p>
          <p className="text-xs text-muted-foreground">Total days</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Cost Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cost per Stop</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budget.perStop}>
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#525ea7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
