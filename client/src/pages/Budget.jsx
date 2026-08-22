import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#4f7cff', '#ff9f4f', '#4fd88a', '#e14f7c'];

export default function Budget() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [budget, setBudget] = useState(null);

  useEffect(() => { request(`/trips/${tripId}/budget`, { token }).then(setBudget); }, [tripId]);

  if (!budget) return <div className="page">Loading...</div>;

  const pieData = Object.entries(budget.breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="page">
      <h1>Trip Budget</h1>
      {budget.overBudget && <p className="error">Over budget! Total ${budget.total} exceeds your ${budget.totalBudget} limit.</p>}

      <div className="grid stats">
        <div className="card"><strong>${budget.total}</strong><span>Total estimated cost</span></div>
        <div className="card"><strong>${budget.averagePerDay}</strong><span>Average per day</span></div>
        <div className="card"><strong>{budget.totalDays}</strong><span>Total days</span></div>
      </div>

      <div className="grid charts">
        <div className="card">
          <h3>Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Cost per Stop</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budget.perStop}>
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#4f7cff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
