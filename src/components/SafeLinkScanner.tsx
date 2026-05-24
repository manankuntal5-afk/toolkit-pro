import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from './Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function SafeLinkScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    score: number, 
    isSafe: boolean, 
    explanation: string,
    publicData?: {
      domainAge?: string;
      registrar?: string;
      serverLocation?: string;
      knownThreats?: string;
      [key: string]: any;
    }
  } | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/check-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!res.ok) {
         const errorText = await res.text();
         throw new Error(errorText || 'Failed to scan URL');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const data = result ? [
    { name: 'Safety %', value: result.score },
    { name: 'Risk / Unsafe %', value: 100 - result.score },
  ] : [];

  const COLORS = result ? [result.isSafe ? '#22c55e' : '#ef4444', '#f1f5f9'] : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Safe Link & Phishing Scanner</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Check if a website link is safe or not. Avoid phishing and scam websites by scanning links before you click.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center justify-center min-w-[150px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan URL'}
          </button>
        </form>

        {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

        {result && (
          <div className="mt-10 border-t border-slate-100 pt-10">
            <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
              <div className="w-48 h-48 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip 
                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-bold", result.isSafe ? "text-green-500" : "text-red-500")}>
                    {result.score}
                  </span>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Score</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {result.isSafe ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <h3 className="text-2xl font-bold text-slate-900">Link is Safe!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-red-500" />
                      <h3 className="text-2xl font-bold text-slate-900">Warning: Unsafe Link</h3>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {result.explanation}
                    </p>
                  </div>

                  {result.publicData && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        OSINT Public Data
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(result.publicData).map(([key, value]) => {
                          if (!value) return null;
                          return (
                            <div key={key} className="flex flex-col">
                              <span className="text-xs text-slate-500 font-medium">{key}</span>
                              <span className="text-sm text-slate-800 font-semibold">{value as React.ReactNode}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Copy the URL</h4>
              <p className="text-slate-600 text-sm mt-1">Copy the website link or URL you want to investigate.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Paste the Link</h4>
              <p className="text-slate-600 text-sm mt-1">Paste the link into the box above and click 'Scan URL'.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Review the Result</h4>
              <p className="text-slate-600 text-sm mt-1">Our AI gives it a safety score out of 100. A score of 100 means completely safe. A red graph means the website might be dangerous or a phishing scam. Read the detailed explanation below the score to understand why.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
