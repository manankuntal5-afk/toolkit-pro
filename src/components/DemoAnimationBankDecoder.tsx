import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MousePointer2,
  ArrowRight,
  ShieldCheck,
  SearchCode,
  ListChecks,
} from "lucide-react";

export default function DemoAnimationBankDecoder() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Uploading Statement
    // 2: Analyzing (Decoding)
    // 3: Result appears
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f4fdf8] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-emerald-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-500" /> Bank Decoder
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            <ShieldCheck className="w-3 h-3" /> Secure
          </span>
        </h3>

        <div className="w-full h-[180px] flex flex-col gap-3 relative">
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden relative flex flex-col p-2">
            {/* Complex statement view */}
            <div className="border border-red-100 bg-red-50/50 rounded mb-2 overflow-hidden shadow-sm">
              <div className="bg-red-100/50 px-2 py-1 text-[8px] font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                <span>Date</span>
                <span>Description (Confusing)</span>
                <span>Amount</span>
              </div>
              <div
                className={`p-1.5 flex justify-between items-center text-[9px] transition-all ${step >= 2 ? "opacity-20 blur-[1px]" : "opacity-100"}`}
              >
                <span className="text-slate-500">12/05</span>
                <span className="font-mono text-slate-700 bg-white border border-slate-200 px-1 rounded shadow-sm">
                  POS/0023/NTFLX*SUB/AMST
                </span>
                <span className="text-red-600 font-bold">- ₹499.00</span>
              </div>
              <div
                className={`border-t border-red-100 p-1.5 flex justify-between items-center text-[9px] transition-all ${step >= 2 ? "opacity-20 blur-[1px]" : "opacity-100"}`}
              >
                <span className="text-slate-500">14/05</span>
                <span className="font-mono text-slate-700 bg-white border border-slate-200 px-1 rounded shadow-sm">
                  NEFT/INB/SBIN000/SALARY
                </span>
                <span className="text-emerald-600 font-bold">+ ₹55,000</span>
              </div>
            </div>

            {/* Upload overlay */}
            {step === 0 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white border-2 border-dashed border-emerald-300 rounded-lg p-3 flex flex-col items-center shadow-lg">
                  <FileText className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">
                    Drop Bank PDF here
                  </span>
                </div>
              </div>
            )}

            {/* Decoding overlay overlay */}
            {step === 2 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center bg-white p-3 rounded-lg shadow-lg border border-emerald-100">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  >
                    <SearchCode className="w-6 h-6 text-emerald-500 mb-1" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-600">
                    Decoding terms...
                  </span>
                </div>
              </div>
            )}

            {/* Decoded result */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-2 bg-white rounded-lg border-2 border-emerald-400 shadow-xl z-20 flex flex-col overflow-hidden"
                >
                  <div className="bg-emerald-500 px-2 py-1.5 text-white flex justify-between items-center">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      ✨ Clear Summary
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-2 flex-1 justify-center">
                    <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-[8px]">
                          N
                        </div>
                        <span className="font-bold text-slate-700">
                          Netflix Subscription
                        </span>
                      </div>
                      <span className="text-red-500 font-bold">- ₹499.00</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 shadow-sm mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[8px]">
                          ₹
                        </div>
                        <span className="font-bold text-slate-700">
                          Monthly Salary Income
                        </span>
                      </div>
                      <span className="text-emerald-500 font-bold">
                        + ₹55,000
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start button for visualization */}
            {step === 1 && (
              <div className="absolute bottom-2 right-2 text-white bg-emerald-500 px-3 py-1 rounded shadow text-[9px] font-bold flex items-center gap-1">
                Decode <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 4 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-50%"
                : step === 1
                  ? "160%"
                  : step === 2
                    ? "160%"
                    : "50%",
            y: step === 0 ? 100 : step === 1 ? 140 : step === 2 ? 140 : 150,
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
