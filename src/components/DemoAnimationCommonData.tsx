import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  MousePointer2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function DemoAnimationCommonData() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial state, cursor moves to File 1
    // 1: File 1 uploaded
    // 2: Cursor moves to File 2
    // 3: File 2 uploaded
    // 4: Cursor moves to Match button and clicks
    // 5: Matching Animation
    // 6: Results presented
    // 7: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 8);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a1a1a_2px,transparent_2px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-slate-200 p-6 relative z-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Excel Matcher
        </h3>

        {/* Upload Areas */}
        <div className="flex justify-between items-center gap-4 mb-6">
          {/* File 1 */}
          <div
            className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${step >= 1 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
          >
            {step >= 1 ? (
              <div className="text-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-emerald-700">
                  List_A.xlsx
                </span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-slate-500">
                  Upload File 1
                </span>
              </div>
            )}
          </div>

          <ArrowRight className="w-6 h-6 text-slate-300 flex-shrink-0" />

          {/* File 2 */}
          <div
            className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${step >= 3 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
          >
            {step >= 3 ? (
              <div className="text-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-emerald-700">
                  List_B.xlsx
                </span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-slate-500">
                  Upload File 2
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="w-48 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm gap-2 transition-transform shadow-md"
            style={{ transform: step === 5 ? "scale(0.97)" : "scale(1)" }}
          >
            {step === 5 ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Find Common Data"
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-4 h-20 relative overflow-hidden">
          <AnimatePresence>
            {step >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col justify-center"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">
                      Match Complete!
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium">
                      Found 143 common rows
                    </p>
                  </div>
                </div>
                {/* Visual representation of matched rows */}
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 bg-emerald-200 rounded-full"
                    ></div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cursor */}
      {step < 6 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-10%"
                : step === 1
                  ? "15%"
                  : step === 2
                    ? "50%"
                    : step === 3
                      ? "75%"
                      : step === 4
                        ? "45%"
                        : step === 5
                          ? "45%"
                          : "150%",
            y:
              step === 0
                ? 80
                : step === 1
                  ? 80
                  : step === 2
                    ? 80
                    : step === 3
                      ? 80
                      : step === 4
                        ? 200
                        : step === 5
                          ? 200
                          : 250,
            scale: step === 1 || step === 3 || step === 5 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "10%", left: "10%" }}
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
