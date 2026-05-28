import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Search,
  ClipboardList,
  IndianRupee,
  MousePointer2,
} from "lucide-react";

export default function DemoAnimationYoutubeRecipe() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Pasting URL
    // 2: Analyzing
    // 3: Result
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fef2f2] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-red-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Youtube className="w-4 h-4 text-red-500" /> Recipe Extractor
        </h3>

        <div className="w-full h-[180px] flex flex-col gap-3 relative">
          {/* Input bar */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${step >= 1 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex-1 overflow-hidden h-6 flex items-center bg-white rounded px-2 shadow-sm border border-slate-100">
              {step >= 1 ? (
                <span className="text-[10px] text-slate-600 truncate opacity-80">
                  https://youtube.com/watch?v=recipe123
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  Paste YouTube link here...
                </span>
              )}
              {step === 1 && (
                <span className="inline-block w-0.5 h-3 bg-red-500 animate-pulse ml-0.5" />
              )}
            </div>
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm transition-colors ${step >= 2 ? "bg-red-600" : "bg-red-500"}`}
            >
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative">
            {step === 2 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col justify-center items-center z-10">
                <Youtube className="w-8 h-8 text-red-500 animate-pulse mb-2" />
                <span className="text-[10px] font-bold text-slate-600">
                  Extracting video...
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step >= 3 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full p-3 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <ClipboardList className="w-3 h-3 text-emerald-500" />{" "}
                      Grocery List
                    </span>
                    <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                      Paneer Tikka
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                      <span>Paneer (250g)</span>
                      <span className="font-bold text-slate-600">₹120</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                      <span>Capsicum (2 units)</span>
                      <span className="font-bold text-slate-600">₹30</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                      <span>Curd/Yogurt (100g)</span>
                      <span className="font-bold text-slate-600">₹25</span>
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-200 pt-1.5 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-500">
                      Estimated Total
                    </span>
                    <span className="font-bold text-emerald-600 text-[12px]">
                      ₹175
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                  <ClipboardList className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-[9px] font-medium text-slate-500 text-center">
                    Ingredients and prices
                    <br />
                    will appear here
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 5 && (
        <motion.div
          animate={{
            x: step === 0 ? "-100%" : step === 1 ? "-40%" : "100%",
            y: step === 0 ? 100 : step === 1 ? 50 : 150,
            scale: step === 1 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "20%", left: "30%" }}
        >
          <MousePointer2
            size={24}
            fill="white"
            strokeWidth={1.5}
            className="drop-shadow-lg"
          />
        </motion.div>
      )}
    </div>
  );
}
