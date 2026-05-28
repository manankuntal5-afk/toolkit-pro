import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MousePointer2,
  Bot,
  Table as TableIcon,
  FileSpreadsheet,
  MessageSquareText,
} from "lucide-react";

export default function DemoAnimationPdfToCsv() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Initial
    // 1: Uploading PDF
    // 2: AI Analyzing
    // 3: User typing question "What's the total?"
    // 4: AI responding
    // 5: User clicks Extract CSV
    // 6: Reset
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 7);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const typedQuestion = "What is the total amount?";
  const displayedQuestion = step >= 3 ? typedQuestion : "";

  return (
    <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-[90%] h-full max-h-[220px] bg-white rounded-xl shadow-xl border border-sky-100 p-4 relative z-10 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-500" /> PDF AI Assistant
        </h3>

        <div className="flex gap-4 h-full flex-1">
          {/* Left panel: Document uploaded */}
          <div className="w-1/3 border border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
            {step >= 1 ? (
              <div className="w-full h-full flex flex-col p-2 gap-1.5 opacity-90">
                <div className="w-12 h-12 bg-white rounded m-auto mb-1 flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-sky-600" />
                </div>
                <div className="h-1.5 w-3/4 mx-auto bg-slate-300 rounded"></div>
                <div className="h-1.5 w-1/2 mx-auto bg-slate-300 rounded"></div>
                {/* Analyzing scanner */}
                {step === 2 && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute left-0 w-full h-0.5 bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.5)]"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileText className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[9px] font-medium text-slate-400 text-center">
                  Upload PDF
                  <br />
                  Statement
                </span>
              </div>
            )}
          </div>

          {/* Right panel: Chat & Output */}
          <div className="w-2/3 flex flex-col gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-2 overflow-hidden relative">
              {!step ? (
                <div className="m-auto text-[9px] text-slate-400 font-medium">
                  Chat history will appear here
                </div>
              ) : (
                <>
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-end bg-sky-100 text-sky-800 text-[9px] px-2 py-1.5 rounded-lg rounded-tr-none font-medium max-w-[90%]"
                    >
                      {displayedQuestion}
                      {step === 3 && (
                        <span className="animate-pulse w-1 h-2.5 bg-sky-500 inline-block ml-0.5 align-middle" />
                      )}
                    </motion.div>
                  )}
                  {step >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-start bg-white border border-slate-200 text-slate-700 text-[9px] px-2 py-1.5 rounded-lg rounded-tl-none font-medium max-w-[90%] shadow-sm"
                    >
                      The total amount is <b>$1,450.00</b>.
                    </motion.div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 h-7 mt-auto">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded flex items-center px-2">
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <MessageSquareText className="w-3 h-3" />
                  {step === 3 ? "Typing..." : "Ask PDF..."}
                </span>
              </div>
              <div
                className={`px-3 rounded flex items-center justify-center text-white font-bold text-[9px] gap-1 shadow-sm transition-all ${step >= 6 ? "bg-emerald-600" : "bg-emerald-500"}`}
                style={{ transform: step === 5 ? "scale(0.95)" : "scale(1)" }}
              >
                <FileSpreadsheet className="w-3 h-3" /> Get CSV
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {step < 6 && (
        <motion.div
          animate={{
            x:
              step === 0
                ? "-100%"
                : step === 1
                  ? "-60%"
                  : step === 2
                    ? "-60%"
                    : step === 3
                      ? "40%"
                      : step === 4
                        ? "40%"
                        : "140%",
            y:
              step === 0
                ? 100
                : step === 1
                  ? 80
                  : step === 2
                    ? 80
                    : step === 3
                      ? 150
                      : step === 4
                        ? 150
                        : 180,
            scale: step === 1 || step === 5 ? 0.9 : 1,
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
