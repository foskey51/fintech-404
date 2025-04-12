import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { csv } from 'd3-fetch';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import _ from 'lodash'; // For debouncing

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TableView = React.memo(() => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [visibleCount, setVisibleCount] = useState(30);
    const [predictions, setPredictions] = useState({});
    const [alreadySent, setAlreadySent] = useState(new Set());
    const [summary, setSummary] = useState({ fraud: 0, legit: 0, review: 0 });
    const [isPredicting, setIsPredicting] = useState(false);
    const [showMoreCount, setShowMoreCount] = useState(100);
    const [isShowDataLoading, setIsShowDataLoading] = useState(false);

    const cleanRow = useCallback((row) => ({
        step: +row.step,
        type: row.type,
        amount: +row.amount,
        oldbalanceOrg: +row.oldbalanceOrg,
        newbalanceOrig: +row.newbalanceOrig,
        oldbalanceDest: +row.oldbalanceDest,
        newbalanceDest: +row.newbalanceDest
    }), []);

    // Fetch CSV data
    useEffect(() => {
        csv('/Fraud.csv')
            .then(fetchedData => {
                setData(fetchedData);
                if (fetchedData.length > 0) {
                    setColumns(Object.keys(fetchedData[0]));
                }
            })
            .catch(error => console.error('Error loading CSV:', error));
    }, []);

    // Update summary based on predictions
    useEffect(() => {
        const countSummary = { fraud: 0, legit: 0, review: 0 };
        Object.values(predictions).forEach(pred => {
            if (pred.status === 'Fraud') countSummary.fraud++;
            else if (pred.status === 'Legitimate') countSummary.legit++;
            else if (pred.status === 'Manual Review') countSummary.review++;
        });
        setSummary(countSummary);
    }, [predictions]);

    // Debounced handleShowMore
    const handleShowMore = useCallback(_.debounce(() => {
        setVisibleCount(prev => prev + showMoreCount);
    }, 300), [showMoreCount]);

    const handleCustomShowMore = useCallback((e) => {
        setShowMoreCount(Number(e.target.value));
    }, []);

    const getRowClass = useCallback((status) => {
        if (status === 'Fraud') return 'bg-red-100';
        if (status === 'Manual Review') return 'bg-yellow-100';
        if (status === 'Legitimate') return 'bg-green-100';
        return '';
    }, []);

    const fetchPredictionsInBatch = useCallback(async () => {
        setIsPredicting(true);
        const batchSize = 50;
        const batches = Math.ceil(visibleCount / batchSize);

        for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
            const batchStart = batchIndex * batchSize;
            const batchEnd = Math.min(batchStart + batchSize, visibleCount);
            const batchRows = data.slice(batchStart, batchEnd).map(cleanRow);

            try {
                const requests = batchRows.map((row, i) =>
                    axios.post('http://localhost:5000/predict', [row])
                        .then(res => {
                            setPredictions(prev => ({
                                ...prev,
                                [batchStart + i]: res.data[0]
                            }));
                            setAlreadySent(prev => new Set(prev).add(batchStart + i));
                        })
                        .catch(err => console.error('Prediction error for row:', batchStart + i, err))
                );
                await Promise.all(requests);
            } catch (err) {
                console.error('Batch request error:', err);
                break;
            }
        }
        setIsPredicting(false);
    }, [visibleCount, data, cleanRow]);

    // Memoized chart data
    const transactionChartData = useMemo(() => ({
        labels: ['Fraud', 'Legitimate', 'Manual Review'],
        datasets: [{
            label: 'Transaction Count',
            data: [summary.fraud, summary.legit, summary.review],
            backgroundColor: ['#EF4444', '#10B981', '#F59E0B'],
            borderColor: ['#B91C1C', '#047857', '#B45309'],
            borderWidth: 1
        }]
    }), [summary]);

    // Memoized chart options
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Total Transactions by Status',
                font: { size: 18 },
                padding: { top: 10, bottom: 20 }
            },
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw}`
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Transaction Status',
                    font: { size: 14 }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Transactions',
                    font: { size: 14 }
                },
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    }), []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleShowDataClick = useCallback(() => {
        setIsShowDataLoading(true);
        setTimeout(() => {
            handleShowMore();
            setIsShowDataLoading(false);
        }, 1000);
    }, [handleShowMore]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow flex items-center">
                    <span className="mr-2 text-lg">✅</span>
                    Legitimate: <span className="font-bold ml-1">{summary.legit}</span>
                </div>
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow flex items-center">
                    <span className="mr-2 text-lg">⚠️</span>
                    Manual Review: <span className="font-bold ml-1">{summary.review}</span>
                </div>
                <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow flex items-center">
                    <span className="mr-2 text-lg">🚨</span>
                    Fraud: <span className="font-bold ml-1">{summary.fraud}</span>
                </div>
            </div>

            <button
                onClick={fetchPredictionsInBatch}
                className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isPredicting}
            >
                {isPredicting ? 'Predicting...' : 'Run Predictions'}
            </button>

            {/* Bar Chart */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
                <div className="h-80">
                    <Bar data={transactionChartData} options={chartOptions} />
                </div>
            </div>

            {/* Show More Controls */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium">Show More:</label>
                    <input
                        type="number"
                        value={showMoreCount}
                        onChange={handleCustomShowMore}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleShowDataClick}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={isShowDataLoading}
                >
                    {isShowDataLoading ? 'Loading...' : 'Show Data'}
                </button>
            </div>

            {/* Original Table View */}
            <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg shadow">
                <table className="min-w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-3 py-2 border-r border-gray-300 font-semibold">
                                    {col}
                                </th>
                            ))}
                            <th className="px-3 py-2 border-r border-gray-300 font-semibold">Prediction</th>
                            <th className="px-3 py-2 border-r border-gray-300 font-semibold">Probability</th>
                            <th className="px-3 py-2 border-r border-gray-300 font-semibold">Status</th>
                            <th className="px-3 py-2 font-semibold">Explanation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, visibleCount).map((row, index) => {
                            const pred = predictions[index];
                            const rowClass = pred ? getRowClass(pred.status) : '';

                            return (
                                <tr key={index} className={`${rowClass} border-b hover:bg-gray-50`}>
                                    {columns.map((col, i) => (
                                        <td key={i} className="px-3 py-1 border-r truncate max-w-[10rem]">
                                            {row[col]}
                                        </td>
                                    ))}
                                    <td className="px-3 py-1 border-r truncate">
                                        {pred?.prediction ?? '...'}
                                    </td>
                                    <td className="px-3 py-1 border-r truncate">
                                        {pred?.fraud_probability != null ? `${pred.fraud_probability}%` : '...'}
                                    </td>
                                    <td className="px-3 py-1 border-r truncate">
                                        {pred?.status ?? 'Pending...'}
                                    </td>
                                    <td className="px-3 py-1 truncate text-xs">
                                        {pred?.explanation ? (
                                            <div className="space-y-1">
                                                {pred.explanation.map((exp, i) => (
                                                    <div key={i} className="flex justify-between">
                                                        <span className="text-gray-700">{exp.feature}</span>
                                                        <span className={`font-semibold ${exp.impact >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                            {exp.impact > 0 ? '+' : ''}{exp.impact.toFixed(4)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            '...'
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Scroll to Top */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
            >
                ↑
            </button>
        </div>
    );
});

export default TableView;