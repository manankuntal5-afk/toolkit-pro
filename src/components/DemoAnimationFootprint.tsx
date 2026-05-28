import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MousePointer2,
  User,
  Mail,
  Phone,
  Globe,
  ShieldAlert,
} from "lucide-react";

export default function DemoAnimationFootprint() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial state, cursor moves to input
    // 1: Typing text
    // 2: Cursor moves and clicks Search
    // 3: Loading
    // 4: Results appear
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 8);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-slate-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-lg border border-slate-200 p-6 relative z-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" /> Digital Footprint Scan
        </h3>

        {/* Form Area */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <div className="w-full h-8 border border-slate-300 rounded bg-slate-50 flex items-center pl-8 text-slate-700 text-xs font-medium">
                {step >= 1 ? "John Doe" : ""}
                {step === 1 && <span className="animate-pulse">|</span>}
              </div>
            </div>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <div className="w-full h-8 border border-slate-300 rounded bg-slate-50 flex items-center pl-8 text-slate-700 text-xs font-medium">
                  {step >= 2 ? "john@example.com" : ""}
                  {step === 2 && <span className="animate-pulse">|</span>}
                </div>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <div className="w-full h-8 border border-slate-300 rounded bg-slate-50 flex items-center pl-8 text-slate-700 text-xs font-medium">
                  {step >= 3 ? "+1 234567890" : ""}
                  {step === 3 && <span className="animate-pulse">|</span>}
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-full h-9 bg-purple-600 rounded flex items-center justify-center text-white font-medium text-xs gap-1.5 transition-transform relative z-20"
            style={{ transform: step === 4 ? "scale(0.97)" : "scale(1)" }}
          >
            {step === 5 ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search size={14} /> Scan Footprint
              </>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="h-20 relative overflow-hidden">
          <AnimatePresence>
            {step >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2 absolute inset-0"
              >
                <div className="p-2.5 rounded-lg border border-red-100 bg-red-50 flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-xs font-bold text-red-700">
                      High Risk • Social Media
                    </p>
                    <p className="text-[10px] text-red-600/80">
                      Public profile found on Facebook
                    </p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-amber-100 bg-amber-50 flex items-center gap-3">
                  <User className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">
                      Medium Risk • Forums
                    </p>
                    <p className="text-[10px] text-amber-600/80">
                      Mentions on public forum boards
                    </p>
                  </div>
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
                ? "-50%"
                : step === 1
                  ? "10%"
                  : step === 2
                    ? "10%"
                    : step === 3
                      ? "60%"
                      : step === 4
                        ? "40%"
                        : "150%",
            y:
              step === 0
                ? 80
                : step === 1
                  ? 55
                  : step === 2
                    ? 100
                    : step === 3
                      ? 100
                      : step === 4
                        ? 145
                        : 200,
            scale: step === 4 ? 0.9 : 1,
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
