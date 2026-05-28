import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MousePointer2,
  AtSign,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export default function DemoAnimationFakeSocial() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial state, cursor goes to input
    // 1: Paste profile link
    // 2: Move to Verify button & click
    // 3: Analyzing...
    // 4: Result Fake
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const typedText = "https://instagram.com/real_giveaway_bot";
  const displayedText = step >= 1 ? typedText : "";

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fef2f2] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-rose-100 p-6 relative z-10 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 w-full">
          <User className="w-5 h-5 text-rose-500" /> Account Detector
        </h3>

        {/* Input area */}
        <div className="w-full relative mb-6">
          <div className="w-full h-10 border border-slate-300 rounded-lg bg-slate-50 flex items-center pl-3 text-slate-600 text-xs font-mono overflow-hidden whitespace-nowrap">
            <AtSign className="w-3.5 h-3.5 text-slate-400 mr-2" />
            {displayedText}
            {step === 1 && (
              <span className="animate-pulse bg-rose-500 w-1.5 h-4 ml-1 inline-block" />
            )}
          </div>

          <div className="mt-4 flex justify-between items-center px-1">
            <div className="text-[10px] text-slate-400 font-medium">
              Checking IG, FB, X, etc.
            </div>
            <div
              className={`h-9 px-4 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md z-20 ${step >= 3 ? "bg-rose-700" : "bg-rose-500"}`}
              style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
            >
              {step === 3 ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search size={14} /> Verify Profile
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full h-24 relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 px-3 flex items-center">
          <AnimatePresence mode="wait">
            {step >= 4 ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden outline outline-2 outline-rose-200 outline-offset-1">
                    <User className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-sm font-bold text-slate-800">
                        @real_giveawa...
                      </h4>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <p className="text-[10px] text-rose-600 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm inline-block">
                      Fake Profile Detected
                    </p>
                  </div>
                </div>
                {/* Score */}
                <div className="flex flex-col items-center mr-3">
                  <span className="text-[10px] text-rose-700 font-bold mb-0.5">
                    Trust Score
                  </span>
                  <span className="text-lg font-black text-rose-600 leading-none">
                    12%
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="w-full text-center flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Results will appear here
                </span>
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
                    ? "110%"
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
