import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { TOOLS } from "../constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BLOG_ARTICLES } from "../blogData";
import { ARTICLES, Article } from "../articlesData";
import { Wrench, Search, X } from "lucide-react";

import DemoAnimation from "./DemoAnimation";
import DemoAnimationFootprint from "./DemoAnimationFootprint";
import DemoAnimationCommonData from "./DemoAnimationCommonData";
import DemoAnimationChatPdf from "./DemoAnimationChatPdf";
import DemoAnimationSafeLink from "./DemoAnimationSafeLink";
import DemoAnimationQRScanner from "./DemoAnimationQRScanner";
import DemoAnimationFakeSocial from "./DemoAnimationFakeSocial";
import DemoAnimationImageResizer from "./DemoAnimationImageResizer";
import DemoAnimationPdfRedactor from "./DemoAnimationPdfRedactor";
import DemoAnimationPdfToCsv from "./DemoAnimationPdfToCsv";
import DemoAnimationPhotoMetadata from "./DemoAnimationPhotoMetadata";
import DemoAnimationWhatsappChecker from "./DemoAnimationWhatsappChecker";
import DemoAnimationDocumentTranslator from "./DemoAnimationDocumentTranslator";
import DemoAnimationTripCalculator from "./DemoAnimationTripCalculator";
import DemoAnimationBrandSizeConverter from "./DemoAnimationBrandSizeConverter";
import DemoAnimationYoutubeRecipe from "./DemoAnimationYoutubeRecipe";
import DemoAnimationTowedVehicle from "./DemoAnimationTowedVehicle";
import DemoAnimationBankDecoder from "./DemoAnimationBankDecoder";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [activeDropdown, setActiveDropdown] = useState<"all" | "security" | "pdf" | null>(null);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const uploadToolIds = [
    "geo-map-animator",
    "common-data-finder",
    "chat-to-pdf",
    "qr-checker",
    "image-compressor",
    "pdf-to-csv",
    "photo-metadata",
    "pdf-redactor",
    "document-translator"
  ];

  const pdfTools = TOOLS.filter(t => uploadToolIds.includes(t.id));
  const securityTools = TOOLS.filter(t => !uploadToolIds.includes(t.id));

  const filteredTools = searchQuery.trim() === "" 
    ? [] 
    : TOOLS.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredArticles = searchQuery.trim() === "" 
    ? [] 
    : ARTICLES.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const location = useLocation();
  const currentToolId = location.pathname.split("/")[1] || "";
  const currentSlug = location.pathname.split("/")[2] || "";
  const currentToolInfo = BLOG_ARTICLES.find(
    (article) => article.toolUrl === `/${currentToolId}`,
  );
  
  const toolArticles = ARTICLES.filter(a => a.toolId === currentToolId);
  const currentArticleInfo = toolArticles.find(a => a.id === currentSlug);

  const currentIndex = currentArticleInfo ? toolArticles.findIndex(a => a.id === currentArticleInfo.id) : -1;
  const nextArticle = currentIndex >= 0 ? toolArticles[(currentIndex + 1) % toolArticles.length] : null;
  const prevArticle = currentIndex >= 0 ? toolArticles[(currentIndex - 1 + toolArticles.length) % toolArticles.length] : null;

  const sliderArticles = currentArticleInfo ? toolArticles.filter(a => a.id !== currentArticleInfo.id) : [];
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isBlogRoute = location.pathname === "/blog";
  const isTool = !!currentToolInfo && !isBlogRoute;
  const isArticleView = !!currentArticleInfo;

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    let timer: any;
    if (isArticleView && sliderArticles.length > 0) {
      timer = setInterval(() => {
        setIsTransitioning(true);
        setSliderIndex(prev => prev + 1);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isArticleView, sliderArticles.length, currentSlug]);

  React.useEffect(() => {
    if (sliderIndex >= sliderArticles.length) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setSliderIndex(0);
      }, 500);
      return () => clearTimeout(resetTimer);
    }
  }, [sliderIndex, sliderArticles.length]);

  const articleHeadingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (!isArticleView) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isArticleView]);

  React.useEffect(() => {
    if (isArticleView && articleHeadingRef.current) {
      // Need a small timeout to ensure layout is done
      setTimeout(() => {
        const yOffset = -100;
        const element = articleHeadingRef.current;
        if (element) {
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    }
  }, [currentSlug, isArticleView]);

  React.useEffect(() => {
    setShowAllArticles(false);
    let link: HTMLLinkElement = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    if (currentToolInfo) {
      document.title =
        (currentToolInfo as any).seoTitle ||
        currentToolInfo.title ||
        "ToolBox Pro";
    } else {
      document.title = "ToolBox Pro";
    }
    
    // Always set favicon to our new SVG
    link.href = "/favicon.svg";
  }, [currentToolInfo]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header - smallpdf style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-2xl font-black text-slate-900 tracking-tight flex-shrink-0 flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-lg overflow-hidden font-bold transition-transform group-hover:scale-105">
                  <Wrench className="w-4 h-4" />
                </div>
                ToolBox
              </Link>

              {/* Nav Links */}
              <nav className="hidden lg:flex space-x-6">
                {/* All Tools dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("all")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === "all" ? null : "all")}
                    className="text-[15px] font-semibold text-[#1a1a1a] hover:text-[#006fff] flex items-center gap-1 transition-colors h-[72px]"
                  >
                    All Tools
                    <svg
                      className={cn(
                        "w-4 h-4 ml-1 opacity-70 transition-transform",
                        activeDropdown === "all" ? "rotate-180" : "",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      "absolute top-[72px] left-0 w-[800px] max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl p-4 transition-all z-50 grid grid-cols-3 gap-2",
                      activeDropdown === "all"
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2 pointer-events-none",
                    )}
                  >
                    {TOOLS.map((t) => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => {
                          setActiveDropdown(null);
                          window.scrollTo(0, 0);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg"
                      >
                        <t.icon
                          className={cn(
                            "w-5 h-5 flex-shrink-0",
                            location.pathname === t.path
                              ? "text-blue-600"
                              : "text-blue-500",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[14px] font-medium truncate",
                            location.pathname === t.path
                              ? "text-blue-600 font-bold"
                              : "text-slate-800",
                          )}
                        >
                          {t.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Security Tools dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("security")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === "security" ? null : "security")}
                    className="text-[15px] font-semibold text-[#1a1a1a] hover:text-[#006fff] flex items-center gap-1 transition-colors h-[72px]"
                  >
                    Security Tools
                    <svg
                      className={cn(
                        "w-4 h-4 ml-1 opacity-70 transition-transform",
                        activeDropdown === "security" ? "rotate-180" : "",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      "absolute top-[72px] left-0 w-[800px] max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl p-4 transition-all z-50 grid grid-cols-3 gap-2",
                      activeDropdown === "security"
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2 pointer-events-none",
                    )}
                  >
                    {securityTools.map((t) => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => {
                          setActiveDropdown(null);
                          window.scrollTo(0, 0);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg"
                      >
                        <t.icon
                          className={cn(
                            "w-5 h-5 flex-shrink-0",
                            location.pathname === t.path
                              ? "text-blue-600"
                              : "text-blue-500",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[14px] font-medium truncate",
                            location.pathname === t.path
                              ? "text-blue-600 font-bold"
                              : "text-slate-800",
                          )}
                        >
                          {t.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* PDF Tools dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("pdf")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === "pdf" ? null : "pdf")}
                    className="text-[15px] font-semibold text-[#1a1a1a] hover:text-[#006fff] flex items-center gap-1 transition-colors h-[72px]"
                  >
                    PDF Tools
                    <svg
                      className={cn(
                        "w-4 h-4 ml-1 opacity-70 transition-transform",
                        activeDropdown === "pdf" ? "rotate-180" : "",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      "absolute top-[72px] left-0 w-[800px] max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl p-4 transition-all z-50 grid grid-cols-3 gap-2",
                      activeDropdown === "pdf"
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2 pointer-events-none",
                    )}
                  >
                    {pdfTools.map((t) => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => {
                          setActiveDropdown(null);
                          window.scrollTo(0, 0);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg"
                      >
                        <t.icon
                          className={cn(
                            "w-5 h-5 flex-shrink-0",
                            location.pathname === t.path
                              ? "text-blue-600"
                              : "text-blue-500",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[14px] font-medium truncate",
                            location.pathname === t.path
                              ? "text-blue-600 font-bold"
                              : "text-slate-800",
                          )}
                        >
                          {t.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Icon Button */}
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  setSearchQuery("");
                }}
                className="text-[#1a1a1a] hover:text-[#006fff] p-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                title="Search Tools & Articles"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <Link
                to="/blog"
                className={cn(
                  "hidden sm:flex text-[15px] font-semibold items-center transition-colors h-[72px]",
                  location.pathname === "/blog"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-[#1a1a1a] hover:text-[#006fff]",
                )}
              >
                Blog
              </Link>
              <button className="hidden sm:block text-[15px] font-semibold text-[#1a1a1a] hover:text-[#006fff] transition-colors ml-4">
                Log In
              </button>
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-lg transition-colors">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay/Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[100] flex items-start justify-center pt-20 px-4 transition-all duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[75vh]">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search className="w-6 h-6 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search tools, guides, and articles (e.g., pdf, map, resizer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 text-slate-800 text-lg outline-none font-medium placeholder-slate-400 bg-transparent"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Box */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {searchQuery.trim() === "" ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="font-medium text-slate-600 mb-1">Search Toolbox Pro</p>
                  <p className="text-sm text-slate-400">Type above to search all 18 tools and helpful articles.</p>
                </div>
              ) : (
                <>
                  {filteredTools.length === 0 && filteredArticles.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="font-medium text-slate-600 mb-1">No results found for "{searchQuery}"</p>
                      <p className="text-sm text-slate-400">Try searching for other terms like "PDF", "Excel", or "Map".</p>
                    </div>
                  ) : (
                    <>
                      {/* Tools Match */}
                      {filteredTools.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">
                            Tools ({filteredTools.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredTools.map((t) => {
                              const tIcon = t.icon;
                              const IconComponent = tIcon;
                              return (
                                <Link
                                  key={t.id}
                                  to={t.path}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    window.scrollTo(0, 0);
                                  }}
                                  className="flex items-center gap-3 p-3 hover:bg-blue-50/60 rounded-xl border border-transparent hover:border-blue-100 group transition-all"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <div className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                      {t.name}
                                    </div>
                                    <div className="text-xs text-slate-500 leading-tight line-clamp-1">
                                      {t.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Articles Match */}
                      {filteredArticles.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">
                            Guides & Articles ({filteredArticles.length})
                          </h3>
                          <div className="space-y-1">
                            {filteredArticles.map((a) => (
                              <Link
                                key={a.id}
                                to={`/${a.toolId}/${a.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex flex-col items-start p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all text-left group"
                              >
                                <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 group-hover:underline leading-snug">
                                  {a.title}
                                </span>
                                <span className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                  {a.summary}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 w-full flex flex-col">
        {/* TOOL WORKSPACE AREA (Dropzone first, on colored background) */}
        {isTool && currentToolInfo && (
          <>
            <div className="bg-[#f0f4f8] pt-12 pb-16 w-full border-b border-gray-200 relative">
              <div className="absolute top-0 left-0 w-full h-[60%] bg-[#e3eaf3] rounded-b-[100%] opacity-40 z-0 pointer-events-none"></div>
              <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center justify-center relative z-10 min-h-[350px]">
                <div className="w-full max-w-[900px] mx-auto">{children}</div>
              </div>
            </div>

            {/* DETAILED CONTENT SECTION */}
            <div className="bg-white py-20 pb-10">
              <div className="max-w-[1000px] mx-auto px-6">
                
                {isArticleView ? (
                  <div className="max-w-4xl mx-auto text-left">
                    <div className="flex justify-between items-center mb-6">
                      {prevArticle && (
                        <Link to={`/${currentToolId}/${prevArticle.id}`} className="text-blue-600 hover:underline font-semibold inline-flex items-center">
                          &larr; Back
                        </Link>
                      )}
                      {nextArticle && (
                        <Link to={`/${currentToolId}/${nextArticle.id}`} className="text-blue-600 hover:underline font-semibold inline-flex items-center ml-auto">
                          Next &rarr;
                        </Link>
                      )}
                    </div>
                    <h1 ref={articleHeadingRef} className="text-[36px] md:text-[44px] font-bold text-[#1a1a1a] mb-8 tracking-tight leading-tight mt-4 scroll-mt-6">
                      {currentArticleInfo.title}
                    </h1>
                    <img src={currentArticleInfo.image} alt={currentArticleInfo.title} className="w-full h-auto rounded-2xl shadow-lg border border-gray-200 mb-10 object-cover max-h-[400px]" />
                    <div className="text-lg text-gray-700 leading-relaxed">
                      {currentArticleInfo.content.split('\n').map((para, i) => {
                        if (para.startsWith('## ')) return <h2 key={i} className="text-3xl font-bold text-gray-900 mt-10 mb-5">{para.replace('## ', '')}</h2>;
                        if (para.startsWith('### ')) return <h3 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{para.replace('### ', '')}</h3>;
                        if (para.match(/^\d+\./)) return <li key={i} className="ml-6 mb-3 list-decimal" dangerouslySetInnerHTML={{__html: para.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />;
                        if (para.trim()) return <p key={i} className="mb-5" dangerouslySetInnerHTML={{__html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />;
                        return null;
                      })}
                    </div>
                    
                    <div className="mt-16 text-center border-t border-gray-200 pt-10">
                      <Link 
                        to={`/${currentToolId}`} 
                        onClick={() => window.scrollTo(0, 0)}
                        className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-2xl py-6 px-16 rounded-full shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_35px_-5px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 transition-all duration-300 tracking-wide"
                      >
                        Use Tool
                      </Link>
                    </div>

                    {/* 5 Related Articles underneath */}
                    {sliderArticles.length > 1 && (
                      <div className="mt-20 border-t border-gray-200 pt-16">
                        <h2 className="text-[28px] font-bold text-[#1a1a1a] mb-10 text-center tracking-tight">
                          Read More Related Articles
                        </h2>
                        <div className="relative w-full overflow-hidden py-4 px-1">
                          <div 
                            className={cn(
                              "flex w-full",
                              isTransitioning ? "transition-transform duration-500 ease-in-out" : "transition-none"
                            )}
                            style={{
                              transform: `translateX(-${isMobile ? sliderIndex * 80 : sliderIndex * 47}%)`
                            }}
                          >
                            {[...sliderArticles, ...sliderArticles].map((article, idx) => (
                              <div 
                                key={`${article.id}-${idx}`} 
                                className="w-[75%] md:w-[43.5%] flex-shrink-0 mr-[5%] md:mr-[3.5%] bg-white border text-left border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col items-start gap-3"
                              >
                                <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
                                <div className="p-5 flex flex-col flex-1 w-full text-left">
                                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                                    <Link to={`/${currentToolId}/${article.id}`} className="hover:text-blue-600">
                                      {article.title}
                                    </Link>
                                  </h3>
                                  <div className="w-full flex items-center justify-start mt-auto pt-3 border-t border-gray-100 text-sm">
                                    <Link to={`/${currentToolId}/${article.id}`} className="text-blue-600 font-bold hover:underline inline-flex items-center">
                                      Read full <span className="ml-1">&darr;</span>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <>
                    <h1 className="text-[36px] md:text-[44px] font-bold text-[#1a1a1a] mb-6 text-center tracking-tight leading-tight">
                      {currentToolInfo.title}
                    </h1>
                    {(currentToolInfo as any).subtitle && (
                      <h2 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a] mb-6 text-center tracking-tight text-opacity-80">
                        {(currentToolInfo as any).subtitle}
                      </h2>
                    )}
                    <p className="text-[18px] md:text-[22px] text-[#4a4a4a] text-center mb-24 max-w-3xl mx-auto leading-relaxed">
                      {currentToolInfo.whatItIs}
                    </p>

                {/* Section 1: How it works with alternating layout */}
                <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
                  <div className="w-full md:w-1/2 order-2 md:order-1">
                    <h2 className="text-[32px] font-bold text-[#1a1a1a] mb-8 leading-tight tracking-tight">
                      How To Use This Tool
                    </h2>
                    <ul className="space-y-6">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg
                            className="w-6 h-6 text-[#10b981]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="ml-4 text-[16px] md:text-[18px] text-[#4a4a4a] leading-relaxed">
                          {currentToolInfo.howItWorks}
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg
                            className="w-6 h-6 text-[#10b981]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="ml-4 text-[16px] md:text-[18px] text-[#4a4a4a] leading-relaxed">
                          Enter your required details or upload the necessary
                          files into the tool interface safely above.
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg
                            className="w-6 h-6 text-[#10b981]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="ml-4 text-[16px] md:text-[18px] text-[#4a4a4a] leading-relaxed">
                          Review the cleanly generated output or download your
                          final resulting file securely in seconds.
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
                    {currentToolInfo.id === "geo-map-animator" ? (
                      <DemoAnimation />
                    ) : currentToolInfo.id === "digital-footprint" ? (
                      <DemoAnimationFootprint />
                    ) : currentToolInfo.id === "common-data-finder" ? (
                      <DemoAnimationCommonData />
                    ) : currentToolInfo.id === "chat-to-pdf" ? (
                      <DemoAnimationChatPdf />
                    ) : currentToolInfo.id === "safe-link-scanner" ? (
                      <DemoAnimationSafeLink />
                    ) : currentToolInfo.id === "qr-checker" ? (
                      <DemoAnimationQRScanner />
                    ) : currentToolInfo.id === "fake-social-checker" ? (
                      <DemoAnimationFakeSocial />
                    ) : currentToolInfo.id === "image-compressor" ? (
                      <DemoAnimationImageResizer />
                    ) : currentToolInfo.id === "pdf-redactor" ? (
                      <DemoAnimationPdfRedactor />
                    ) : currentToolInfo.id === "pdf-to-csv" ? (
                      <DemoAnimationPdfToCsv />
                    ) : currentToolInfo.id === "photo-metadata" ? (
                      <DemoAnimationPhotoMetadata />
                    ) : currentToolInfo.id === "whatsapp-checker" ? (
                      <DemoAnimationWhatsappChecker />
                    ) : currentToolInfo.id === "document-translator" ? (
                      <DemoAnimationDocumentTranslator />
                    ) : currentToolInfo.id === "trip-calculator" ? (
                      <DemoAnimationTripCalculator />
                    ) : currentToolInfo.id === "brand-size-converter" ? (
                      <DemoAnimationBrandSizeConverter />
                    ) : currentToolInfo.id === "youtube-recipe" ? (
                      <DemoAnimationYoutubeRecipe />
                    ) : currentToolInfo.id === "towed-vehicle-finder" ? (
                      <DemoAnimationTowedVehicle />
                    ) : currentToolInfo.id === "bank-decoder" ? (
                      <DemoAnimationBankDecoder />
                    ) : (
                      <img
                        src={currentToolInfo.image}
                        alt={currentToolInfo.title}
                        className="rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-[500px] h-auto object-cover border border-gray-100"
                      />
                    )}
                  </div>
                </div>

                {/* Section 2: Real Life Use & Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                  <div>
                    <div className="w-12 h-12 bg-[#f0f4ff] text-[#006fff] rounded-xl flex items-center justify-center mb-6">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-[24px] font-bold text-[#1a1a1a] mb-4 tracking-tight">
                      Real Life Application
                    </h3>
                    <p className="text-[16px] text-[#4a4a4a] leading-relaxed">
                      {currentToolInfo.realLifeUse}
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-[#fff0f0] text-[#e5322d] rounded-xl flex items-center justify-center mb-6">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-[24px] font-bold text-[#1a1a1a] mb-4 tracking-tight">
                      Core Benefits
                    </h3>
                    <p className="text-[16px] text-[#4a4a4a] leading-relaxed">
                      {currentToolInfo.benefits}
                    </p>
                  </div>
                </div>

                {/* Articles Section for the Tool */}
                {toolArticles.length > 0 && (
                  <div className="w-full max-w-[1200px] mx-auto border-t border-gray-200 pt-16">
                    <h2 className="text-[32px] font-bold text-[#1a1a1a] mb-10 text-center tracking-tight">
                      Guides & Articles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      {toolArticles.slice(0, showAllArticles ? toolArticles.length : 3).map((article) => (
                        <div key={article.id} className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col items-start gap-4">
                          <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                          <div className="p-6 flex flex-col flex-1 w-full text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              <Link to={`/${currentToolId}/${article.id}`} className="hover:text-blue-600">
                                {article.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600 mb-6 flex-1 line-clamp-3 w-full">{article.summary}</p>
                            <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                              <Link to={`/${currentToolId}/${article.id}`} className="text-blue-600 font-bold hover:underline inline-flex items-center">
                                Read full article <span className="ml-1">&darr;</span>
                              </Link>
                              <Link 
                                to={`/${currentToolId}`} 
                                onClick={() => window.scrollTo(0, 0)}
                                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Open Tool
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!showAllArticles && toolArticles.length > 3 && (
                      <div className="text-center mb-10">
                        <button 
                          onClick={() => setShowAllArticles(true)}
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors border border-gray-300"
                        >
                          Show more articles
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </>
                )}

                {/* Explore Our Other Tools Section */}
                <div className="w-full max-w-[1200px] mx-auto border-t border-gray-200 pt-16">
                  <h2 className="text-[32px] font-bold text-[#1a1a1a] mb-10 text-center tracking-tight">
                    Explore Our Other Tools
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {TOOLS.filter((t) => t.path !== location.pathname).map(
                      (tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            onClick={() => window.scrollTo(0, 0)}
                            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-[#006fff] hover:shadow-lg transition-all text-center group cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-blue-600 transition-colors">
                              {tool.name}
                            </span>
                          </Link>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* FAQs Section */}
                {!isArticleView && (
                <div className="w-full max-w-[800px] mx-auto pt-24 mt-24 border-t border-gray-200">
                  <h2 className="text-[32px] font-bold text-[#1a1a1a] mb-10 text-center tracking-tight">
                    FAQs
                  </h2>
                  <div className="space-y-6">
                    {currentToolInfo.faq.map((f, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-xl p-6 bg-[#fafafa]"
                      >
                        <h4 className="text-[18px] font-bold text-[#1a1a1a] mb-2">
                          {f.q}
                        </h4>
                        <p className="text-[16px] text-[#4a4a4a] leading-relaxed">
                          {f.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* NON-TOOL PAGES (Like generic /blog) */}
        {!isTool && (
          <div className="max-w-[1200px] w-full mx-auto px-4 py-12">
            {children}
          </div>
        )}
      </main>
      {/* Modern Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200 mt-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm">
              <Link
                to="/"
                className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6 group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
                  <Wrench className="w-5 h-5" />
                </div>
                ToolBox Pro
              </Link>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                A collection of beautiful, fast, and completely secure utilities
                for your everyday digital needs. Process data, not your privacy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-16 md:gap-24">
              <div>
                <h4 className="text-slate-900 font-black mb-6 text-[15px] uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/about"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-[15px]"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-[15px]"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-slate-900 font-black mb-6 text-[15px] uppercase tracking-wider">
                  Legal
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/privacy"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-[15px]"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-[15px]"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200">
            <p className="text-slate-400 font-medium text-[14px]">
              © {new Date().getFullYear()} ToolBox Pro. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium text-[14px] hover:text-slate-600 cursor-pointer transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                English
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
