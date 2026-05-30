import React from "react";
import { Link } from "react-router-dom";
import { BLOG_ARTICLES } from "../blogData";
import { ARTICLES } from "../articlesData";

export default function Blog() {
  return (
    <div className="max-w-[1000px] mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] tracking-tight mb-4 leading-tight">
          Tools & Guides
        </h1>
        <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto">
          Explore our collection of tools, read detailed step-by-step guides,
          and learn how to simplify your daily tasks online securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_ARTICLES.map((article) => {
          const toolId = article.toolUrl.replace('/', '');
          const firstArticle = ARTICLES.find(a => a.toolId === toolId);
          return (
          <article
            key={article.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image Header */}
            <div className="w-full h-48 overflow-hidden bg-gray-50 flex-shrink-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-4 leading-snug">
                {article.title}
              </h2>
              <p className="text-[#4a4a4a] text-[16px] leading-relaxed mb-6 line-clamp-3">
                {article.whatItIs}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                {firstArticle && (
                  <Link 
                    to={`/${toolId}/${firstArticle.id}`} 
                    className="text-blue-600 font-bold hover:underline inline-flex items-center"
                  >
                    Read full article <span className="ml-1">&darr;</span>
                  </Link>
                )}
                <Link
                  to={article.toolUrl}
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-auto"
                >
                  Open Tool
                </Link>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
