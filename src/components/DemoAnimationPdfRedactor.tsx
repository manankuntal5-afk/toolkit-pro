import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MousePointer2, ShieldMinus, Download } from "lucide-react";

export default function DemoAnimationPdfRedactor() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Upload PDF
    // 2: Selecting text to redact
    // 3: Apply black box / blur
    // 4: Download ready
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-slate-200 p-5 relative z-10 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 w-full border-b border-slate-100 pb-2">
          <ShieldMinus className="w-5 h-5 text-indigo-500" /> PDF Redactor
        </h3>

        <div className="w-full flex gap-4 mt-2 h-40">
          {/* Main Stage */}
          <div
            className={`flex-[1.5] w-full h-full border-2 rounded-xl flex items-center justify-center overflow-hidden transition-colors relative ${step >= 1 ? "border-slate-200 bg-slate-50" : "border-dashed border-slate-300 bg-slate-50"}`}
          >
            {step >= 1 ? (
              <div className="w-full h-full flex flex-col items-center p-2 bg-white shadow-sm border border-slate-200">
                <div className="w-full flex items-center gap-2 mb-2 border-b pb-1">
                  <FileText className="w-4 h-4 text-red-500" />
                  <div className="h-2 w-20 bg-slate-200 rounded"></div>
                </div>
                <div className="w-full space-y-2 px-2 mt-2">
                  <div className="h-2 w-full bg-slate-200 rounded"></div>
                  <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                  <div className="flex gap-1 relative">
                    <div className="h-2 w-1/4 bg-slate-200 rounded"></div>
                    <div className="h-2 w-2/4 bg-slate-300 rounded relative overflow-hidden">
                      {/* Highlight & Redact Animation */}
                      {step === 2 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1 }}
                          className="absolute top-0 left-0 h-full bg-yellow-200/50"
                        />
                      )}
                      {step >= 3 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-0 left-0 w-full h-full bg-slate-900"
                        />
                      )}
                    </div>
                    <div className="h-2 w-1/4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-[10px] font-medium text-slate-400">
                  Upload PDF
                </span>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div
              className={`w-full py-2 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md z-20 ${step >= 3 ? "bg-indigo-700" : "bg-indigo-600"}`}
              style={{
                transform: step === 2 ? "scale(0.95)" : "scale(1)",
                opacity: step < 1 ? 0.5 : 1,
              }}
            >
              <ShieldMinus size={14} /> Redact Text
            </div>

            <AnimatePresence>
              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-2 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 text-[11px] shadow-sm cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 5 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-80%"
                : step === 1
                  ? "10%"
                  : step === 2
                    ? "100%"
                    : "100%",
            y: step === 0 ? 120 : step === 1 ? 80 : step === 2 ? 140 : 140,
            scale: step === 2 ? 0.9 : 1,
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
