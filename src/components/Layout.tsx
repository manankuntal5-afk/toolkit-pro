import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600 flex-shrink-0">
              ToolBox Pro
            </Link>
            <nav className="hidden md:flex space-x-1 lg:space-x-2 overflow-x-auto pb-2 -mb-2 custom-scrollbar">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    title={tool.name}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {tool.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
        
        {/* Tool Grid at bottom as requested */}
        <div className="mt-16 border-t border-slate-200 pt-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Other Tools</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {TOOLS.filter(t => t.path !== location.pathname).map(tool => {
               const Icon = tool.icon;
               return (
                 <Link key={tool.id} to={tool.path} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all text-center">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                     <Icon className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-medium text-slate-700">{tool.name}</span>
                 </Link>
               )
             })}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} ToolBox Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
