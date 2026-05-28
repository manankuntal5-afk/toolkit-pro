import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MousePointer2,
  Languages,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function DemoAnimationDocumentTranslator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Uploading doc
    // 2: Translating
    // 3: Done showing side-by-side
    // 4: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fafafa] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-indigo-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-indigo-500" /> PDF Translator
          </span>
          {step >= 3 && (
            <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
              100% Format Preserved
            </span>
          )}
        </h3>

        <div className="w-full flex gap-3 h-[180px] items-center justify-center relative">
          {/* Left Doc (Original) */}
          <div
            className={`w-[110px] h-[150px] bg-white border shadow-sm rounded flex flex-col p-2 relative transition-all ${step >= 1 ? "border-indigo-200" : "border-slate-200 border-dashed bg-slate-50"}`}
          >
            <div className="border-b-2 border-slate-800 pb-1 mb-2">
              <div className="h-2 w-3/4 bg-slate-800 mb-1"></div>
              <div className="h-1.5 w-1/2 bg-slate-400"></div>
            </div>
            {/* Text lines */}
            <div className="space-y-1 mb-2">
              <div className="h-1 w-full bg-slate-200"></div>
              <div className="h-1 w-full bg-slate-200"></div>
              <div className="h-1 w-4/5 bg-slate-200"></div>

              <div className="h-1 w-full bg-slate-200 mt-2"></div>
              <div className="h-1 w-full bg-slate-200"></div>
              <div className="h-1 w-3/4 bg-slate-200"></div>
            </div>

            {/* Seal / Signature block */}
            <div className="mt-auto flex justify-between items-end">
              <div className="w-6 h-6 border-2 border-red-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border border-red-300 rounded-full"></div>
              </div>
              <div className="font-[cursive] text-[8px] text-blue-800 transform -rotate-6">
                El Director
              </div>
            </div>

            {step === 0 && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[9px] font-medium text-slate-400 text-center">
                  Upload
                  <br />
                  Spanish PDF
                </span>
              </div>
            )}
          </div>

          {/* Center Arrow / Translator */}
          <div className="w-12 flex flex-col items-center justify-center gap-1 z-10">
            {step === 2 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-500 flex items-center justify-center bg-white shadow-sm"
              >
                <Languages className="w-4 h-4 text-indigo-500" />
              </motion.div>
            ) : step >= 3 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </motion.div>
            ) : (
              <ArrowRight className="text-slate-300 w-6 h-6" />
            )}
          </div>

          {/* Right Doc (Translated) */}
          <div className="w-[110px] h-[150px] bg-white border border-slate-200 shadow-sm rounded flex flex-col p-2 relative overflow-hidden">
            {step >= 3 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex flex-col"
              >
                <div className="border-b-2 border-slate-800 pb-1 mb-2 relative">
                  {/* Translated Title Highlight */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -inset-1 bg-indigo-100/50 rounded pointer-events-none"
                  />
                  <div className="h-2 w-3/4 bg-slate-800 mb-1 relative z-10"></div>
                  <div className="h-1.5 w-1/2 bg-slate-400 relative z-10"></div>
                </div>
                {/* Translated Text lines (identical layout, tinted slightly to show it's new text) */}
                <div className="space-y-1 mb-2 relative">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="absolute -inset-1 bg-indigo-100/50 rounded pointer-events-none"
                  />
                  <div className="h-1 w-full bg-slate-300"></div>
                  <div className="h-1 w-full bg-slate-300"></div>
                  <div className="h-1 w-4/5 bg-slate-300"></div>

                  <div className="h-1 w-full bg-slate-300 mt-2"></div>
                  <div className="h-1 w-full bg-slate-300"></div>
                  <div className="h-1 w-3/4 bg-slate-300"></div>
                </div>

                {/* Seal / Signature block PERFECTLY PRESERVED */}
                <div className="mt-auto flex justify-between items-end relative">
                  <div className="absolute -inset-2 border-2 border-dashed border-emerald-400 rounded-lg opacity-50" />
                  <div className="w-6 h-6 border-2 border-red-400 rounded-full flex items-center justify-center z-10">
                    <div className="w-4 h-4 border border-red-300 rounded-full"></div>
                  </div>
                  <div className="font-[cursive] text-[8px] text-blue-800 transform -rotate-6 z-10">
                    The Director
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center border-dashed border-2 border-slate-200">
                <span className="text-[9px] font-medium text-slate-400 text-center">
                  English
                  <br />
                  Translation
                </span>
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
                ? "-140%"
                : step === 1
                  ? "-20%"
                  : step === 2
                    ? "-20%"
                    : "50%",
            y: step === 0 ? 120 : step === 1 ? 140 : step === 2 ? 140 : 150,
            scale: step === 1 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "20%", left: "40%" }}
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
