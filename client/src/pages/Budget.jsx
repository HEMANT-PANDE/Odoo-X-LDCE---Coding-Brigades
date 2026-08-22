import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Wallet, CalendarDays, TrendingUp, MapPin, ArrowLeft, Eye, Plane, Hotel, UtensilsCrossed, Target } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#16302B', '#F2A93B', '#E15B4F', '#7FA593'];

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
  transport: Plane,
  stay: Hotel,
  meals: UtensilsCrossed,
  activities: Target,
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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#16302B]/60">
          Calculating budget breakdown...
        </div>
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
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-8 space-y-8">
        {/* Header Manifest Card */}
        <div className="relative rounded-2xl border border-[#16302B]/12 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/50 mb-1">
                <Link to={`/trips/${tripId}/builder`} className="hover:text-[#E15B4F] flex items-center gap-1">
                  <ArrowLeft className="size-3" /> Back to Builder
                </Link>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">
                Trip Budget Breakdown
              </h1>
              <p className="mt-1 font-mono text-xs text-[#16302B]/65">
                Expense estimates across transit, lodging, meals &amp; booked activities.
              </p>
            </div>

            <Link
              to={`/trips/${tripId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#16302B]/20 bg-transparent px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#16302B] transition-colors hover:bg-[#16302B]/5 self-start"
            >
              <Eye className="size-3.5" /> View Timeline
            </Link>
          </div>

          {/* Metric cards inside hero */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-dashed border-[#16302B]/15 pt-4">
            {[
              { label: 'Total Estimated', value: `$${budget.total}`, icon: Wallet },
              { label: 'Avg per Day', value: `$${budget.averagePerDay}`, icon: TrendingUp },
              { label: 'Total Days', value: budget.totalDays, icon: CalendarDays },
              budget.totalBudget
                ? { label: 'Budget Limit', value: `$${budget.totalBudget}`, icon: MapPin }
                : { label: 'Destination Stops', value: budget.perStop.length, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/45 flex items-center gap-1">
                  <Icon className="size-3 text-[#E15B4F]" /> {label}
                </p>
                <p className="font-serif text-2xl font-semibold text-[#16302B] mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {usedPercent !== null && (
            <div className="mt-5 border-t border-dashed border-[#16302B]/15 pt-4">
              <div className="flex justify-between font-mono text-[10px] uppercase text-[#16302B]/60 mb-1.5">
                <span>Budget allocated: {usedPercent.toFixed(1)}%</span>
                <span>${budget.total} / ${budget.totalBudget}</span>
              </div>
              <div className="h-2 bg-[#16302B]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budget.overBudget ? 'bg-[#E15B4F]' : 'bg-[#16302B]'}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {budget.overBudget && (
          <div className="flex items-center gap-2.5 rounded-xl border border-[#E15B4F]/30 bg-[#E15B4F]/10 px-4 py-3 text-xs text-[#E15B4F] font-medium">
            <AlertTriangle className="size-4 flex-shrink-0" />
            <span>Over budget! Estimated <strong>${budget.total}</strong> exceeds your limit by <strong>${(budget.total - budget.totalBudget).toFixed(2)}</strong>.</span>
          </div>
        )}

        {/* Breakdown Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(budget.breakdown).map(([key, val]) => {
            const Icon = BREAKDOWN_ICONS[key];
            return (
              <div key={key} className="rounded-xl border border-[#16302B]/12 bg-white p-5 text-center shadow-none transition-all duration-200 hover:-translate-y-1 hover:border-[#16302B]/30 hover:shadow-sm">
                <Icon className="mx-auto mb-2 size-6 text-[#E15B4F]" />
                <p className="font-serif text-xl font-bold text-[#16302B]">${val}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#16302B]/50 capitalize mt-0.5">{key}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie */}
          <div className="rounded-xl border border-[#16302B]/12 bg-white p-6 shadow-none">
            <h3 className="font-serif text-base font-semibold text-[#16302B] mb-4">Cost Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
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
                <Legend formatter={(value) => <span className="font-mono text-xs text-[#16302B]/70 capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar */}
          <div className="rounded-xl border border-[#16302B]/12 bg-white p-6 shadow-none">
            <h3 className="font-serif text-base font-semibold text-[#16302B] mb-4">Cost per City Stop</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#16302B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#16302B' }} />
                <Tooltip formatter={(v) => [`$${v}`, '']} />
                <Legend formatter={(value) => <span className="font-mono text-xs text-[#16302B]/70">{value}</span>} />
                <Bar dataKey="Transport" stackId="a" fill="#16302B" />
                <Bar dataKey="Stay" stackId="a" fill="#F2A93B" />
                <Bar dataKey="Meals" stackId="a" fill="#7FA593" />
                <Bar dataKey="Activities" stackId="a" fill="#E15B4F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-stop breakdown table */}
        {budget.perStop.length > 0 && (
          <div className="rounded-xl border border-[#16302B]/12 bg-white overflow-hidden shadow-none">
            <div className="px-6 py-4 border-b border-dashed border-[#16302B]/15 bg-[#FBF6ED]/50">
              <h3 className="font-serif text-base font-semibold text-[#16302B]">Ledger Breakdown by Stop</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-[#16302B]/10 bg-black/[0.02] text-[#16302B]/50 uppercase text-[10px] tracking-wider">
                  <tr>
                    {['City', 'Days', 'Transport', 'Stay', 'Meals', 'Activities', 'Total'].map((h) => (
                      <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16302B]/10">
                  {budget.perStop.map((s) => (
                    <tr key={s.stopId} className="hover:bg-black/[0.015] transition-colors">
                      <td className="px-6 py-3 font-serif font-semibold text-sm text-[#16302B]">{s.city}</td>
                      <td className="px-6 py-3 text-[#16302B]/60">{s.days}</td>
                      <td className="px-6 py-3 text-[#16302B]/70">${s.transport}</td>
                      <td className="px-6 py-3 text-[#16302B]/70">${s.stay}</td>
                      <td className="px-6 py-3 text-[#16302B]/70">${s.meals}</td>
                      <td className="px-6 py-3 text-[#16302B]/70">${s.activities}</td>
                      <td className="px-6 py-3 font-bold text-[#16302B]">${s.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#16302B] text-[#FBF6ED]">
                    <td className="px-6 py-3.5 font-serif font-semibold text-sm" colSpan={6}>Grand Ledger Total</td>
                    <td className="px-6 py-3.5 font-bold text-[#F2A93B] text-base">${budget.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
