import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  MapPin,
  Fuel,
  Calculator,
  ArrowRight,
  IndianRupee,
  MousePointer2,
} from "lucide-react";

export default function DemoAnimationTripCalculator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Filling details
    // 2: Calculating...
    // 3: Result
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fffbeb] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-amber-200 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-500" /> Trip Calculator
          </span>
        </h3>

        <div className="w-full flex gap-3 h-[180px] relative">
          {/* Left Form */}
          <div className="w-[140px] flex flex-col gap-2 relative">
            <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-col gap-2 flex-1">
              <div className="flex bg-white border border-slate-200 rounded px-1.5 py-1 items-center gap-1.5 shadow-sm overflow-hidden">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="text-[9px] font-medium text-slate-700 whitespace-nowrap">
                  {step >= 1 ? "Mumbai" : "Start Location"}
                  {step === 1 && (
                    <span className="inline-block w-0.5 h-2 bg-amber-500 animate-pulse ml-0.5" />
                  )}
                </span>
              </div>
              <div className="flex bg-white border border-slate-200 rounded px-1.5 py-1 items-center gap-1.5 shadow-sm overflow-hidden">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[9px] font-medium text-slate-700 whitespace-nowrap">
                  {step >= 1 ? "Pune" : "Destination"}
                </span>
              </div>

              <div className="flex gap-1.5 mt-1">
                <div className="flex-1 flex bg-white border border-slate-200 rounded px-1 py-1 items-center gap-1 shadow-sm overflow-hidden">
                  <Fuel className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[8px] font-medium text-slate-700">
                    15 km/l
                  </span>
                </div>
                <div className="flex-1 flex bg-white border border-slate-200 rounded px-1 py-1 items-center justify-center shadow-sm">
                  <span className="text-[8px] font-medium text-amber-600 font-bold">
                    Petrol
                  </span>
                </div>
              </div>

              <div
                className={`mt-auto w-full py-1.5 rounded flex items-center justify-center text-white text-[9px] font-bold shadow-sm transition-all ${step >= 2 ? "bg-amber-600" : "bg-amber-500"}`}
                style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
              >
                <Calculator className="w-3 h-3 mr-1" /> Calculate
              </div>
            </div>
          </div>

          {/* Right Map & Result */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded relative overflow-hidden flex flex-col">
            {/* Map background placeholder */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20,50 Q60,10 100,50 T180,50"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="20" cy="50" r="4" fill="#ef4444" />
                <circle cx="180" cy="50" r="4" fill="#10b981" />
              </svg>
            </div>

            {step === 2 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Calculator className="w-6 h-6 text-amber-500" />
                </motion.div>
                <span className="text-[9px] font-bold text-slate-500 mt-1">
                  Calculating...
                </span>
              </div>
            )}

            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-2 bg-white rounded-lg shadow-lg border border-amber-100 p-2 flex flex-col z-20"
                >
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Estimated Trip Cost
                  </div>

                  <div className="flex flex-col gap-1.5 mb-2 flex-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-600">Fuel Cost</span>
                      <span className="font-mono font-bold">₹1,250</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-600">Toll Taxes</span>
                      <span className="font-mono font-bold">₹320</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center bg-amber-50 rounded px-2 py-1">
                    <span className="text-[11px] font-bold text-slate-800">
                      Total Price
                    </span>
                    <span className="text-[12px] font-bold text-emerald-600 flex items-center">
                      ₹1,570
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 3 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
                <div className="bg-white px-2 py-1 rounded shadow text-[8px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> 150 km Route
                </div>
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
                ? "-100%"
                : step === 1
                  ? "-60%"
                  : step === 2
                    ? "-60%"
                    : "140%",
            y: step === 0 ? 100 : step === 1 ? 80 : step === 2 ? 150 : 150,
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
