import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  FileText,
  MousePointer2,
  Smartphone,
  Download,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function DemoAnimationChatPdf() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial state, cursor goes to mobile frame
    // 1: Select Screenshot
    // 2: Move to Convert button & click
    // 3: Loading/Scanning
    // 4: PDF Ready
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f9fafb] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-slate-200 p-6 relative z-10 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Chat Exporter
        </h3>

        <div className="flex w-full justify-between items-center px-4">
          {/* Upload Section - Mobile Frame */}
          <div className="relative w-28 h-40 border-4 border-slate-700 rounded-xl bg-slate-50 overflow-hidden flex flex-col">
            <div className="w-10 h-1 bg-slate-700 mx-auto mt-1 rounded-full opacity-50" />
            <div className="flex-1 flex flex-col items-center justify-center p-2">
              {step >= 1 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full h-full bg-blue-100 rounded border border-blue-200 p-1 flex flex-col gap-1"
                >
                  {/* Simulated Chat UI */}
                  <div className="w-full h-3 bg-blue-300 rounded-sm" />
                  <div className="w-3/4 h-2 bg-slate-300 rounded-sm self-start mt-1" />
                  <div className="w-3/4 h-2 bg-blue-400 rounded-sm self-end" />
                  <div className="w-2/3 h-2 bg-slate-300 rounded-sm self-start" />
                  <div className="w-full h-8 bg-blue-200 mt-auto rounded flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </motion.div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[10px] font-medium text-slate-400 text-center">
                    Add Screenshot
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Arrow / Convert Button */}
          <div className="flex flex-col items-center justify-center px-4">
            <div
              className={`w-28 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md z-20 relative ${step >= 3 ? "bg-blue-700" : "bg-blue-600"}`}
              style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
            >
              {step === 3 ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step >= 4 ? (
                <>
                  Ready <CheckCircle2 size={14} />
                </>
              ) : (
                "Convert to PDF"
              )}
            </div>
            {step < 3 && <ArrowRight className="w-5 h-5 text-slate-300 mt-3" />}
          </div>

          {/* Result Section - PDF output */}
          <div
            className={`relative w-28 h-40 rounded-lg flex flex-col items-center justify-center border-2 transition-colors ${step >= 4 ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-dashed border-slate-200"}`}
          >
            <AnimatePresence>
              {step >= 4 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center p-2"
                >
                  <FileText className="w-10 h-10 text-indigo-600 mb-2" />
                  <div className="text-[10px] font-bold text-indigo-800">
                    Court_Ready.pdf
                  </div>
                  <div className="text-[8px] text-indigo-600 mt-1 flex items-center gap-1">
                    <Download className="w-2.5 h-2.5" /> Download
                  </div>
                </motion.div>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 text-center">
                  PDF Result
                </span>
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
                  ? "-80%"
                  : step === 2
                    ? "0%"
                    : "100%",
            y: step === 0 ? 120 : step === 1 ? 120 : step === 2 ? 80 : 150,
            scale: step === 1 || step === 2 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "20%", left: "50%" }}
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
