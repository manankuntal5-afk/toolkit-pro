import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_ARTICLES } from '../blogData';

export default function Blog() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">ToolBox Tutorials & Usage Guides</h1>
        <p className="text-lg text-slate-600">Complete, detailed step-by-step guides on how to use our free OSINT tools.</p>
      </div>

      <div className="space-y-16">
        {BLOG_ARTICLES.map((article) => (
          <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transform transition hover:shadow-lg">
            {/* Image Header */}
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <div className="p-6 md:p-8">
              {/* Keyword pill */}
              <div className="mb-4">
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  Free Tool Guide
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{article.title}</h2>
              
              <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">Yeh Tool Kya Hai?</h3>
                  <p className="text-base leading-relaxed">{article.whatItIs}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">Kaise Kaam Karta Hai?</h3>
                  <p className="text-base leading-relaxed">{article.howItWorks}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Aam Jeevan Me Upyog</h3>
                  <p className="text-base leading-relaxed italic text-slate-600">"{article.realLifeUse}"</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">Fayde Aur Time Saving</h3>
                  <p className="text-base leading-relaxed font-medium text-emerald-700 bg-emerald-50 p-3 rounded">{article.benefits}</p>
                </div>
              </div>

              {/* Call to action */}
              <div className="my-8 text-center bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Try it yourself directly in your browser:</h4>
                <Link to={article.toolUrl} className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-xl transform hover:-translate-y-1">
                  Use Tool Online Free &rarr;
                </Link>
              </div>

              {/* FAQ Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions (FAQs)</h3>
                <div className="space-y-4">
                  {article.faq.map((f, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-bold text-slate-800 text-lg mb-2">Q: {f.q}</p>
                      <p className="text-slate-600">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                 <p className="text-sm text-slate-400 font-mono tracking-tighter">Keywords: {article.keyword}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
