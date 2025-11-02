import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { CATEGORY_PALETTE } from './categoryColors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/**
 * Static line chart: shows each account's current balance across fixed labels.
 * No timers, no live updates.
 */
const AccountBalancesLineCard = ({ accounts = [] }) => {
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

  const datasets = accounts.map((a, i) => ({
    label: a.name,
    data: Array.from({ length: labels.length }, () => Number(a.balance)), // flat static line per account
    borderColor: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    backgroundColor: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] + '33',
    pointRadius: 2,
    tension: 0.25,
    fill: false,
  }));

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { ticks: { callback: (v) => `$${Number(v).toFixed(0)}` } },
    },
  };

  return (
    <section className="card">
      <header className="card-header">
        <h2>Account Balances </h2>
      </header>
      <div className="chart-box">
        <Line data={data} options={options} />
      </div>
    </section>
  );
};

export default AccountBalancesLineCard;
