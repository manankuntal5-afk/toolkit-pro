import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon,
  ShieldCheck,
  ShieldAlert,
  MousePointer2,
  Search,
  ArrowRight,
} from "lucide-react";

export default function DemoAnimationSafeLink() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Cursor moves to input
    // 1: Paste link
    // 2: Cursor clicks scan
    // 3: Scanning...
    // 4: Result (Fake Link)
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const typedText = "http://secure-login-bank-update.xyz";
  const displayedText = step >= 1 ? typedText : "";

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a1a1a_2px,transparent_2px)] [background-size:20px_20px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-slate-200 p-6 relative z-10 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 w-full">
          <LinkIcon className="w-5 h-5 text-blue-600" /> Safe Link Scanner
        </h3>

        {/* Input area */}
        <div className="w-full relative px-2 mb-6">
          <div className="w-full h-10 border border-slate-300 rounded-lg bg-slate-50 flex items-center pl-3 text-slate-600 text-xs font-mono overflow-hidden whitespace-nowrap">
            {displayedText}
            {step === 1 && (
              <span className="animate-pulse bg-blue-500 w-1.5 h-4 ml-1 inline-block" />
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <div
              className={`h-9 px-4 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md z-20 ${step >= 3 ? "bg-indigo-600" : "bg-blue-600"}`}
              style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
            >
              {step === 3 ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search size={14} /> Scan Link
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full h-24 relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 px-2 flex items-center">
          <AnimatePresence mode="wait">
            {step >= 4 ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-700">
                      DANGEROUS LINK
                    </h4>
                    <p className="text-[10px] text-red-600 font-medium">
                      Phishing/Scam detected. Do not open!
                    </p>
                  </div>
                </div>
                {/* Score Chart */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#fee2e2"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="125.6"
                      initial={{ strokeDashoffset: 125.6 }}
                      animate={{ strokeDashoffset: 125.6 * (1 - 0.95) }} // 95% risk
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-red-700">
                    95%
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="w-full text-center text-xs text-slate-400 font-medium"
              >
                Paste a link above to see the safety score here.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cursor */}
      {step < 4 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-30%"
                : step === 1
                  ? "10%"
                  : step === 2
                    ? "70%"
                    : "150%",
            y: step === 0 ? 150 : step === 1 ? 95 : step === 2 ? 140 : 250,
            scale: step === 2 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "20%", left: "20%" }}
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
