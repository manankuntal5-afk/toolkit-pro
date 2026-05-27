import React from "react";
import { Link } from "react-router-dom";
import { BLOG_ARTICLES } from "../blogData";

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
        {BLOG_ARTICLES.map((article) => (
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

              <div className="mt-auto">
                <Link
                  to={article.toolUrl}
                  className="w-full flex items-center justify-center bg-[#006fff] hover:bg-[#005cde] text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Open Tool
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
