import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Search,
  ExternalLink,
  MousePointer2,
  AlertTriangle,
} from "lucide-react";

export default function DemoAnimationTowedVehicle() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Selecting city
    // 2: Searching
    // 3: Result appears
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-blue-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Truck className="w-4 h-4 text-blue-500" /> Towed Vehicle Finder
        </h3>

        <div className="w-full h-[180px] flex flex-col gap-3 relative">
          {/* Top UI Area */}
          <div
            className={`flex flex-col gap-2 p-2 rounded-lg border transition-colors ${step >= 1 ? "bg-blue-50/50 border-blue-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-slate-200 rounded p-1.5 flex justify-between items-center shadow-sm relative">
                <span
                  className={`text-[10px] font-medium ${step >= 1 ? "text-slate-800" : "text-slate-400"}`}
                >
                  {step >= 1 ? "Mumbai" : "Select City..."}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>

                {/* Dropdown simulate */}
                <AnimatePresence>
                  {step === 0 && /* Just flashed quickly before step 1 */ null}
                </AnimatePresence>
              </div>

              <div
                className={`w-16 h-7 rounded flex items-center justify-center gap-1 text-[10px] font-bold text-white shadow-sm transition-colors ${step >= 2 ? "bg-blue-600" : "bg-blue-500"}`}
              >
                <Search className="w-3 h-3" /> Find
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative p-3">
            {step === 2 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col justify-center items-center z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Search className="w-6 h-6 text-blue-500 mb-1" />
                </motion.div>
                <span className="text-[10px] font-bold text-slate-500">
                  Searching Police Database...
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step >= 3 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full flex flex-col"
                >
                  <div className="flex items-start gap-2 mb-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 leading-tight">
                        Official Link Found
                      </p>
                      <p className="text-[9px] text-emerald-600 leading-tight mt-0.5">
                        Mumbai Traffic Police Towing Portal
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center text-center gap-2 border border-dashed border-slate-300 rounded p-2 bg-white">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-[9px] font-medium text-slate-500">
                        Click below to check your vehicle number
                      </p>
                      <p className="text-[10px] font-bold text-slate-800 mt-0.5">
                        https://trafficpolicemumbai.maharashtra.gov.in/towed-vehicles
                      </p>
                    </div>
                    <div className="mt-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-bold flex items-center gap-1">
                      Visit Official Site <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                  <Truck className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-[9px] font-medium text-slate-500 text-center">
                    Select your city
                    <br />
                    to find towed vehicles
                  </span>
                </div>
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
                    ? "60%"
                    : "60%",
            y: step === 0 ? 100 : step === 1 ? 40 : step === 2 ? 40 : 150,
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
