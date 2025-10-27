import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORY_PALETTE } from './categoryColors';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryPieCard = ({ transactions = [] }) => {
    const { labels, data } = useMemo(() => {
        const spend = new Map();
        transactions.forEach((t) => {
            const amt = Number(t.amount) || 0;
            if (amt < 0) {
                const key = t.category || 'Uncategorized';
                spend.set(key, (spend.get(key) || 0) + Math.abs(amt));
            }
        });
        return { labels: Array.from(spend.keys()), data: Array.from(spend.values()) };
    }, [transactions]);

    const pieData = {
        labels,
        datasets: [
            {
                label: 'Spending',
                data,
                backgroundColor: labels.map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]),
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // container controls size
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (ctx) => `$${ctx.parsed.toFixed(2)} — ${ctx.label}` } },
        },
    };

    return (
        <section className="card">
            <header className="card-header">
                <h2>Spending by Category</h2>
            </header>
            {data.length ? (
                <div className="chart-box">
                    <Pie data={pieData} options={options} />
                </div>
            ) : (
                <div className="empty">No spending data to display.</div>
            )}
        </section>
    );
};

export default CategoryPieCard;
