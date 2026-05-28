import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  MousePointer2,
  ScanLine,
  User,
  Building2,
  AtSign,
} from "lucide-react";

export default function DemoAnimationQRScanner() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Cursor moves to upload
    // 1: Upload QR image
    // 2: Move to Scan button & click
    // 3: Scanning animation (laser over QR)
    // 4: Results shown
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-slate-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-slate-200 p-5 relative z-10 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-600" /> QR Fraud Detector
        </h3>

        <div className="flex gap-4">
          {/* Main Stage */}
          <div className="flex-1 flex flex-col gap-3 items-center">
            {/* Upload Area */}
            <div
              className={`relative w-28 h-28 border-2 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${step >= 1 ? "border-emerald-500 bg-emerald-50" : "border-dashed border-slate-300 bg-slate-50"}`}
            >
              {step >= 1 ? (
                <>
                  <div className="w-20 h-20 opacity-80 grid grid-cols-2 gap-1 p-1">
                    {/* Simulated QR Code */}
                    <div className="bg-slate-800 rounded-sm"></div>
                    <div className="bg-slate-800 rounded-sm scale-75"></div>
                    <div className="bg-slate-800 rounded-sm scale-90"></div>
                    <div className="bg-slate-800 rounded-sm"></div>
                  </div>
                  {/* Scanner line */}
                  {step === 3 && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)] z-20"
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <QrCode className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-[10px] font-medium text-slate-400">
                    Upload QR
                  </span>
                </div>
              )}
            </div>

            <div
              className={`w-28 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md z-20 ${step >= 3 ? "bg-emerald-600" : "bg-emerald-500"}`}
              style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
            >
              <ScanLine size={14} /> Scan Image
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-[1.5] border border-slate-200 rounded-xl bg-[#f8fafc] p-3 flex flex-col justify-center min-h-[140px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step >= 4 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex justify-center h-full"
                >
                  <div className="w-full flex-col justify-center items-start gap-2 h-full my-auto mt-2">
                    <div className="w-full bg-white border border-slate-200 rounded p-2 mb-2 shadow-sm flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                          Account Name
                        </p>
                        <p className="text-xs font-bold text-slate-700 leading-none">
                          Rakesh Kumar
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded p-2 mb-2 shadow-sm flex items-center gap-2">
                      <AtSign className="w-3.5 h-3.5 text-purple-500" />
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                          UPI ID
                        </p>
                        <p className="text-xs font-bold text-slate-700 leading-none">
                          rakesh123@okicici
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded p-2 shadow-sm flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                          Bank
                        </p>
                        <p className="text-[10px] font-bold text-slate-700 leading-none">
                          ICICI Bank
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <span className="text-[10px] text-slate-400 font-medium text-center px-4">
                    Upload and scan
                    <br />
                    to verify details
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
                ? "-80%"
                : step === 1
                  ? "-40%"
                  : step === 2
                    ? "-40%"
                    : "150%",
            y: step === 0 ? 150 : step === 1 ? 90 : step === 2 ? 180 : 250,
            scale: step === 1 || step === 2 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "10%", left: "40%" }}
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
