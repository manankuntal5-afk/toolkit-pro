import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, MousePointer2, ArrowRight } from "lucide-react";

export default function DemoAnimationBrandSizeConverter() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Selecting current brand/size
    // 2: Selecting target brand
    // 3: Result appears
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fdf8f6] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-orange-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shirt className="w-4 h-4 text-orange-500" /> Size Converter
        </h3>

        <div className="w-full h-[180px] flex flex-col gap-3 relative">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2 rounded-lg relative z-10 transition-colors">
            <div className="flex flex-col gap-1 w-[40%]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                You Wear
              </span>
              <div
                className={`p-1.5 rounded border text-[10px] font-medium flex items-center justify-between transition-colors ${step >= 1 ? "border-orange-300 bg-orange-50 text-orange-800" : "bg-white border-slate-200 text-slate-500"}`}
              >
                <span>Zara</span>
                <span className="font-bold bg-white px-1 rounded shadow-sm">
                  M
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-[20%]">
              <motion.div
                animate={{ scale: step === 2 ? 1.2 : 1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? "bg-orange-100" : "bg-slate-100"}`}
              >
                <ArrowRight
                  className={`w-3 h-3 ${step >= 2 ? "text-orange-500" : "text-slate-400"}`}
                />
              </motion.div>
            </div>

            <div className="flex flex-col gap-1 w-[40%]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Buy From
              </span>
              <div
                className={`p-1.5 rounded border text-[10px] font-medium flex items-center justify-between transition-colors ${step >= 2 ? "border-orange-300 bg-orange-50 text-orange-800" : "bg-white border-slate-200 text-slate-400"}`}
              >
                <span>{step >= 2 ? "H&M" : "Select..."}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step >= 3 ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="flex flex-col items-center text-center w-full"
                >
                  <span className="text-[10px] font-medium text-slate-500 mb-2">
                    Your perfect fit in H&M is:
                  </span>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center shadow-inner relative">
                      <span className="text-3xl font-black text-orange-600">
                        L
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="flex flex-col items-center text-center opacity-40"
                >
                  <Shirt className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[9px] font-medium text-slate-600">
                    Select brands above
                    <br />
                    to convert size
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
                  ? "-20%"
                  : step === 2
                    ? "100%"
                    : "100%",
            y: step === 0 ? 100 : step === 1 ? 50 : step === 2 ? 50 : 150,
            scale: step === 1 || step === 2 ? 0.9 : 1,
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
