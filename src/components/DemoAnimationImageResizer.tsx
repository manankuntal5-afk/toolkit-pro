import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  MousePointer2,
  Settings2,
  Download,
  Maximize,
} from "lucide-react";

export default function DemoAnimationImageResizer() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Upload image
    // 2: Type inputs (width/height)
    // 3: Move to convert
    // 4: Resize animation
    // 5: Show result
    // 6: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 7);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fafafa] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-[90%] bg-white rounded-2xl shadow-xl border border-blue-100 p-5 relative z-10 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 w-full border-b border-slate-100 pb-2">
          <Maximize className="w-5 h-5 text-blue-500" /> Image Resizer
        </h3>

        <div className="w-full flex gap-4 mt-2">
          {/* Left Column: Image box */}
          <div className="flex-1 flex flex-col gap-2">
            <div
              className={`w-full aspect-square border-2 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${step >= 1 ? "border-blue-200 bg-blue-50/50" : "border-dashed border-slate-300 bg-slate-50"}`}
            >
              {step >= 1 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    initial={{ width: "80%", height: "80%" }}
                    animate={{
                      width: step >= 4 ? "50%" : "80%",
                      height: step >= 4 ? "50%" : "80%",
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="bg-blue-100 border border-blue-300 rounded flex items-center justify-center overflow-hidden shadow-sm"
                  >
                    <ImageIcon className="w-8 h-8 text-blue-400 opacity-50" />
                  </motion.div>
                  {/* Resize crosshairs */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.9] }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Settings2 className="w-8 h-8 text-blue-500 animate-spin-slow" />
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-[10px] font-medium text-slate-400">
                    Upload Photo
                  </span>
                </div>
              )}
            </div>

            {/* Dimensions text */}
            <div className="text-center h-4">
              {step >= 1 && step < 4 && (
                <span className="text-[10px] font-mono text-slate-500">
                  Original: 1920x1080
                </span>
              )}
              {step >= 4 && (
                <span className="text-[10px] font-mono text-blue-600 font-bold">
                  Resized: 800x800
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="flex-1 flex flex-col justify-center gap-3 relative">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Width (px)
                </label>
                <div
                  className={`h-8 rounded bg-slate-50 border flex items-center px-2 text-xs font-mono transition-colors ${step >= 2 ? "border-blue-300 text-slate-700" : "border-slate-200 text-slate-400"}`}
                >
                  {step >= 2 ? "800" : "auto"}
                  {step === 2 && (
                    <span className="animate-pulse bg-blue-500 w-1 h-3 ml-0.5 inline-block" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Height (px)
                </label>
                <div
                  className={`h-8 rounded bg-slate-50 border flex items-center px-2 text-xs font-mono transition-colors ${step >= 2 ? "border-blue-300 text-slate-700" : "border-slate-200 text-slate-400"}`}
                >
                  {step >= 2 ? "800" : "auto"}
                </div>
              </div>
            </div>

            <div className="mt-2 h-9 relative">
              <AnimatePresence mode="wait">
                {step >= 5 ? (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold shadow-md"
                  >
                    <Download size={14} /> Download
                  </motion.div>
                ) : (
                  <motion.div
                    key="resize"
                    className={`absolute inset-0 rounded-lg flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-all shadow-md ${step >= 4 ? "bg-blue-700" : "bg-blue-600"}`}
                    style={{
                      transform: step === 3 ? "scale(0.95)" : "scale(1)",
                    }}
                  >
                    <Settings2 size={14} /> Resize Image
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 5 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-30%"
                : step === 1
                  ? "160%"
                  : step === 2
                    ? "160%"
                    : step === 3
                      ? "160%"
                      : "160%",
            y:
              step === 0
                ? 150
                : step === 1
                  ? 50
                  : step === 2
                    ? 100
                    : step === 3
                      ? 180
                      : 180,
            scale: step === 3 ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "10%", left: "30%" }}
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
