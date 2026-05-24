import React, { useState, useRef } from 'react';
import { Eraser, UploadCloud, FileDown, Loader2 } from 'lucide-react';
import { cn } from './Layout';

export default function PdfRedactor() {
  const [file, setFile] = useState<File | null>(null);
  const [word, setWord] = useState('');
  const [actionType, setActionType] = useState<'blur' | 'hide' | null>(null);
  const [scope, setScope] = useState<'all' | 'first' | null>(null);
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: upload/word, 2: action, 3: scope, 4: processing/done
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
  };

  const processFile = () => {
    setLoading(true);
    setStep(4);
    
    // MOCK PROCESSING
    setTimeout(() => {
      setLoading(false);
      
      // MOCK DOWNLOAD (Download the same file just to demonstrate)
      if(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `redacted_${file.name}`;
        a.click();
      }
    }, 2500);
  };

  const reset = () => {
    setFile(null);
    setWord('');
    setActionType(null);
    setScope(null);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 mb-4">
          <Eraser className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">PDF Word Hide/Blur</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Hide or blur any specific word in your PDF document. Very useful for redacting sensitive information like passwords or account numbers.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <div className="flex items-center justify-center mb-8 pb-8 border-b border-slate-100">
          <div className="flex items-center">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>1</div>
            <div className={cn("w-12 h-1 transition-colors", step >= 2 ? "bg-blue-600" : "bg-slate-100")}></div>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>2</div>
            <div className={cn("w-12 h-1 transition-colors", step >= 3 ? "bg-blue-600" : "bg-slate-100")}></div>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>3</div>
            <div className={cn("w-12 h-1 transition-colors", step >= 4 ? "bg-blue-600" : "bg-slate-100")}></div>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 4 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>4</div>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Upload PDF & Select Word</h3>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl h-48 flex flex-col items-center justify-center p-8 transition-colors"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf" 
                    className="hidden" 
                  />
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                  <h3 className="text-md font-medium text-slate-900 mb-1">Select PDF File</h3>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Eraser className="text-blue-500 w-6 h-6 flex-shrink-0" />
                    <span className="font-medium text-blue-900 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-sm text-blue-600 hover:underline flex-shrink-0 ml-4">Change</button>
                </div>
              )}

              {file && (
                <div className="space-y-2 pt-4">
                  <label className="text-sm font-semibold text-slate-700">Which word do you want to hide?</label>
                  <input
                    type="text"
                    value={word}
                    onChange={e => setWord(e.target.value)}
                    placeholder="e.g.: Account Number, Password..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!word.trim()}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Choose Action</h3>
              <p className="text-center text-slate-500 mb-8">What do you want to do with the word "{word}"?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setActionType('blur'); setStep(3); }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all gap-4 group"
                >
                  <div className="text-3xl filter blur-sm group-hover:blur-[2px] transition-all">BLUR</div>
                  <span className="font-medium text-slate-700">Blur Word</span>
                </button>
                <button 
                  onClick={() => { setActionType('hide'); setStep(3); }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-2xl hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all gap-4"
                >
                  <div className="w-16 h-8 bg-slate-900 rounded"></div>
                  <span className="font-medium">Blackout (Hide)</span>
                </button>
              </div>
              <button onClick={() => setStep(1)} className="text-blue-600 text-sm font-medium hover:underline w-full text-center mt-4">Back</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Select Scope</h3>
              <p className="text-center text-slate-500 mb-8">Where do you want to {actionType === 'blur' ? 'blur' : 'hide'} the word "{word}"?</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setScope('first'); processFile(); }}
                  className="p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="font-semibold text-lg text-slate-800 mb-1">First Instance Only</div>
                  <p className="text-slate-500 text-sm">Only {actionType === 'blur' ? 'blur' : 'hide'} the very first time this word appears in the file.</p>
                </button>
                <button 
                   onClick={() => { setScope('all'); processFile(); }}
                   className="p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="font-semibold text-lg text-slate-800 mb-1">Whole File</div>
                  <p className="text-slate-500 text-sm">Find and {actionType === 'blur' ? 'blur' : 'hide'} every instance of this word throughout the file.</p>
                </button>
              </div>
              <button onClick={() => setStep(2)} className="text-blue-600 text-sm font-medium hover:underline w-full text-center mt-4">Back</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Processing PDF...</h3>
                  <p className="text-slate-500">Searching for '{word}', applying {actionType} to {scope === 'all' ? 'all instances' : 'first instance'}.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <FileDown className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Success!</h3>
                  <p className="text-slate-500 mb-8">Your redacted PDF has been downloaded automatically.</p>
                  
                  <button onClick={reset} className="px-6 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition-colors">
                    Start Another File
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload and Target</h4>
              <p className="text-slate-600 text-sm mt-1">Upload your PDF file and type the exact word you want to hide (e.g. your account number or name).</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Choose Action (Hide/Blur)</h4>
              <p className="text-slate-600 text-sm mt-1">Choose whether you want to cover the word with a black box or just blur it out.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Apply and Download</h4>
              <p className="text-slate-600 text-sm mt-1">Decide if you want to apply the redaction everywhere in the file or just the first time it appears. Then your new PDF will download automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
