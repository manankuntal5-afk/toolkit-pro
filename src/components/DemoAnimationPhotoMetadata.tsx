import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  MousePointer2,
  Camera,
  MapPin,
  Calendar,
  Smartphone,
} from "lucide-react";

export default function DemoAnimationPhotoMetadata() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Uploading Photo
    // 2: Analyzing / Scanning metadata
    // 3: Results appearing
    // 4: Map pin showing
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#fdfbf7] flex items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] bg-white rounded-xl shadow-xl border border-amber-100 p-4 relative z-10 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Camera className="w-4 h-4 text-amber-500" /> Photo EXIF Viewer
        </h3>

        <div className="w-full flex gap-4 h-[160px]">
          {/* Left panel: Image upload block */}
          <div
            className={`w-[120px] rounded-lg border-2 flex items-center justify-center relative overflow-hidden transition-all ${step >= 1 ? "border-amber-200 bg-amber-50/50" : "border-dashed border-slate-300 bg-slate-50"}`}
          >
            {step >= 1 ? (
              <div className="w-full h-full p-2 flex items-center justify-center relative">
                <div className="w-full h-full bg-slate-200 rounded overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80"
                    alt="Sample"
                    className="w-full h-full object-cover"
                  />
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
                      className="absolute left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.8)]"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[9px] font-medium text-slate-400">
                  Upload Photo
                </span>
              </div>
            )}
          </div>

          {/* Right panel: Metadata results */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step >= 3 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2 w-full h-full justify-center"
                >
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-200 p-1.5 rounded flex items-center gap-2 shadow-sm"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                        Device
                      </div>
                      <div className="text-[9px] font-bold text-slate-700 leading-none">
                        Apple iPhone 15 Pro
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-slate-200 p-1.5 rounded flex items-center gap-2 shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <div>
                      <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                        Date & Time
                      </div>
                      <div className="text-[9px] font-bold text-slate-700 leading-none">
                        Oct 24, 2023 - 14:32 PM
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-slate-200 p-1.5 rounded flex items-center gap-2 shadow-sm relative overflow-hidden"
                  >
                    {step >= 4 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      </motion.div>
                    )}
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <div>
                      <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                        Location
                      </div>
                      <div className="text-[9px] font-bold text-slate-700 leading-none">
                        40.7128° N, 74.0060° W
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="w-full h-full flex items-center justify-center"
                >
                  <span className="text-[9px] text-slate-400 font-medium text-center">
                    Extracted EXIF data
                    <br />
                    will appear here
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 3 && (
        <motion.div
          animate={{
            x: step === 0 ? "-80%" : step === 1 ? "-40%" : "150%",
            y: step === 0 ? 120 : step === 1 ? 80 : 150,
            scale: step === 1 ? 0.9 : 1,
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
