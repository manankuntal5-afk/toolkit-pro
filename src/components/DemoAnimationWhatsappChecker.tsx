import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  MousePointer2,
  CheckCircle2,
  XCircle,
  Download,
  FileAudio as FilePdf,
} from "lucide-react";

export default function DemoAnimationWhatsappChecker() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Uploading CSV
    // 2: Checking/Scanning
    // 3: Results (Ticks)
    // 4: Download PDF
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f4fdf8] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-green-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> WhatsApp Bulk
            Checker
          </span>
          {step >= 3 && (
            <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
              100 Numbers Processed
            </span>
          )}
        </h3>

        <div className="w-full flex gap-4 h-[160px]">
          {/* Left panel: Upload and Progress */}
          <div className="w-[120px] flex flex-col gap-2">
            <div
              className={`flex-1 rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all ${step >= 1 ? "border-green-200 bg-green-50/50" : "border-dashed border-slate-300 bg-slate-50"}`}
            >
              <FileSpreadsheet
                className={`w-8 h-8 mb-1 ${step >= 1 ? "text-green-500" : "text-slate-300"}`}
              />
              <span className="text-[9px] font-medium text-slate-400 text-center">
                {step >= 1 ? "contacts.csv" : "Upload Excel/CSV"}
              </span>

              {/* Scanning overlay */}
              {step === 2 && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 w-full h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.8)]"
                />
              )}
            </div>

            <div className="h-8">
              <AnimatePresence>
                {step >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full w-full bg-red-500 text-white rounded shadow-sm flex items-center justify-center gap-1 text-[9px] font-bold cursor-pointer"
                  >
                    <Download size={12} /> Get PDF
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Results list */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1.5 overflow-hidden relative">
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider flex px-1 border-b pb-1">
              <div className="flex-1">Phone Number</div>
              <div className="w-12 text-center">Status</div>
            </div>

            <AnimatePresence mode="wait">
              {step >= 3 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-1.5"
                >
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border p-1.5 rounded flex items-center justify-between shadow-sm"
                  >
                    <span className="text-[10px] font-mono text-slate-700">
                      +1 234 567 8900
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border p-1.5 rounded flex items-center justify-between shadow-sm"
                  >
                    <span className="text-[10px] font-mono text-slate-700">
                      +44 789 012 3456
                    </span>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </motion.div>
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border p-1.5 rounded flex items-center justify-between shadow-sm relative overflow-hidden"
                  >
                    <span className="text-[10px] font-mono text-slate-700">
                      +91 987 654 3210
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border p-1.5 rounded flex items-center justify-between shadow-sm opacity-50"
                  >
                    <span className="text-[10px] font-mono text-slate-700">
                      +1 555 123 4567
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="w-full flex-1 flex flex-col items-center justify-center text-slate-400"
                >
                  <span className="text-[9px] font-medium text-center">
                    Numbers will appear
                    <br />
                    after scan
                  </span>
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
                  ? "-40%"
                  : step === 4
                    ? "-40%"
                    : "50%",
            y: step === 0 ? 120 : step === 1 ? 80 : step === 4 ? 140 : 150,
            scale: step === 1 || step === 4 ? 0.9 : 1,
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
