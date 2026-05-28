import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  UploadCloud,
  FileSpreadsheet,
  MousePointer2,
} from "lucide-react";

export default function DemoAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial state (Upload box visible)
    // 1: Cursor moves to upload
    // 2: Upload box clicked / loading state
    // 3: Map visible with pins dropping
    // 4: Lines drawing
    // 5: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#e3eaf3]">
      {/* Background Map Image */}
      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        alt="Map background"
      />

      {/* Markers & Paths (Shows in step 3 & 4) */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* SVG Lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              style={{ zIndex: 10 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="4"
                  refX="5"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#16a34a" />
                </marker>
              </defs>
              <motion.path
                d="M 20 60 Q 40 30, 50 50 T 80 60"
                fill="none"
                stroke="#16a34a"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: step >= 4 ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </svg>

            {/* Pins */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute left-[20%] top-[60%] -translate-x-1/2 -translate-y-full z-20 text-red-600 drop-shadow-md"
            >
              <MapPin
                size={32}
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-full z-20 text-red-600 drop-shadow-md"
            >
              <MapPin
                size={32}
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute left-[80%] top-[60%] -translate-x-1/2 -translate-y-full z-20 text-red-600 drop-shadow-md"
            >
              <MapPin
                size={32}
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Box (Shows in step 0,1,2) */}
      <AnimatePresence>
        {step < 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center p-8 z-30 bg-white/40 backdrop-blur-[2px]"
          >
            <div className="bg-[#11B3A5] w-[80%] max-w-sm rounded-[24px] p-6 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-2 border border-dashed border-white/60 pointer-events-none rounded-[16px]" />
              <div className="flex justify-center mb-4 text-white drop-shadow-sm mt-4">
                <FileSpreadsheet size={48} strokeWidth={1.5} />
              </div>
              <div
                className="bg-white text-[#1a1a1a] px-5 py-2.5 rounded-lg font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm relative z-10 transition-transform mb-4 w-[160px]"
                style={{ transform: step === 2 ? "scale(0.95)" : "scale(1)" }}
              >
                <UploadCloud size={18} />
                {step === 2 ? "LOADING..." : "CHOOSE FILES"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor */}
      {step < 3 && (
        <motion.div
          animate={{
            x: step === 0 ? "100%" : "0%",
            y: step === 0 ? "100%" : "20px",
            scale: step === 2 ? 0.9 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute z-50 text-slate-800 drop-shadow-md w-8 h-8 pointer-events-none"
          style={{ top: "65%", left: "48%" }}
        >
          <MousePointer2
            size={32}
            fill="white"
            strokeWidth={1.5}
            className="drop-shadow-lg"
          />
        </motion.div>
      )}
    </div>
  );
}
