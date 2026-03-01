'use client';

import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DebugDBPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/debug-grammar');
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Failed to fetch');
            }

            setData(json.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Database className="text-indigo-500" />
                                DB Random Inspector
                            </h1>
                            <p className="text-slate-500">Showing 5 random items from grammar_table</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No data found in grammar_table</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-sm font-bold">
                                            ID: {item.id}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-sm font-semibold">
                                            {item.category || 'No Category'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Pattern (공식)</h3>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-indigo-600 font-medium">
                                            {item.pattern}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Description (설명)</h3>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                            {item.description || item.scenario}
                                        </div>
                                    </div>
                                </div>

                                {(item.scenario && item.description !== item.scenario) && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Scenario (Extra)</h3>
                                        <p className="text-slate-600 text-sm">{item.scenario}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
