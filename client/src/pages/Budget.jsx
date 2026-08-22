import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#525EA7', '#FFC349', '#5FACD3', '#97DDE9'];

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Calculating budget...</p>
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
  }));

  const usedPercent = budget.totalBudget
    ? Math.min((budget.total / budget.totalBudget) * 100, 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${budget.overBudget ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-indigo-700 to-indigo-500'} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-2 text-indigo-200 text-sm">
              <Link to={`/trips/${tripId}/builder`} className="hover:text-white transition-colors">
                ← Back to Itinerary Builder
              </Link>
            </div>
            <Link
              to={`/trips/${tripId}`}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              👁 View Itinerary
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mt-2">Trip Budget</h1>

          {budget.overBudget && (
            <div className="mt-3 flex items-center gap-2 bg-red-800/60 border border-red-400/40 text-white px-4 py-3 rounded-xl text-sm font-medium">
              <span className="text-xl">⚠️</span>
              <span>Over budget! Estimated <strong>${budget.total}</strong> exceeds your <strong>${budget.totalBudget}</strong> limit by <strong>${(budget.total - budget.totalBudget).toFixed(2)}</strong>.</span>
            </div>
          )}

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Estimated', value: `$${budget.total}`, icon: '💰' },
              { label: 'Avg per Day', value: `$${budget.averagePerDay}`, icon: '📅' },
              { label: 'Total Days', value: budget.totalDays, icon: '🗓️' },
              budget.totalBudget
                ? { label: 'Budget Limit', value: `$${budget.totalBudget}`, icon: '🎯' }
                : { label: 'City Stops', value: budget.perStop.length, icon: '📍' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Budget progress bar */}
          {usedPercent !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-indigo-200 mb-1">
                <span>Budget used: {usedPercent.toFixed(1)}%</span>
                <span>${budget.total} / ${budget.totalBudget}</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budget.overBudget ? 'bg-red-300' : 'bg-amber-400'}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Cost breakdown cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(budget.breakdown).map(([key, val]) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">{BREAKDOWN_ICONS[key]}</div>
              <p className="text-2xl font-bold text-gray-800">${val}</p>
              <p className="text-gray-500 text-sm capitalize mt-0.5">{key}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  labelLine={false}
                  label={CustomLabel}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, '']} />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600 capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Cost per Stop</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${v}`, '']} />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
                <Bar dataKey="Transport" stackId="a" fill="#525EA7" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Stay" stackId="a" fill="#FFC349" />
                <Bar dataKey="Meals" stackId="a" fill="#5FACD3" />
                <Bar dataKey="Activities" stackId="a" fill="#97DDE9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per-stop table */}
        {budget.perStop.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Breakdown by Stop</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    {['City', 'Days', 'Transport', 'Stay', 'Meals', 'Activities', 'Total'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {budget.perStop.map((s) => (
                    <tr key={s.stopId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-800">{s.city}</td>
                      <td className="px-6 py-3 text-gray-500">{s.days}</td>
                      <td className="px-6 py-3 text-gray-600">${s.transport}</td>
                      <td className="px-6 py-3 text-gray-600">${s.stay}</td>
                      <td className="px-6 py-3 text-gray-600">${s.meals}</td>
                      <td className="px-6 py-3 text-gray-600">${s.activities}</td>
                      <td className="px-6 py-3 font-bold text-indigo-700">${s.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50">
                    <td className="px-6 py-3 font-bold text-gray-800" colSpan={6}>Grand Total</td>
                    <td className="px-6 py-3 font-bold text-indigo-700 text-base">${budget.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
