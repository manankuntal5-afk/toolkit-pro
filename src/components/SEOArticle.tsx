import React from "react";

export function SEOArticle({
  title,
  content,
  keywords,
  toolUrl,
}: {
  title: string;
  content: React.ReactNode;
  keywords: string;
  toolUrl?: string;
}) {
  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
      <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
        {content}
      </div>

      {toolUrl && (
        <div className="mt-8 text-center">
          <a
            href={toolUrl}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Use This Tool Now
          </a>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-400">
          <strong>Users also searched for:</strong> {keywords}
        </p>
      </div>
    </div>
  );
}
