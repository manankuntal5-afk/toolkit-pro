import React, { useState, useRef, useEffect } from 'react';
import { Eraser, UploadCloud, FileDown, Loader2, Eye, Download } from 'lucide-react';
import { cn } from './Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PdfRedactor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [docLang, setDocLang] = useState('English');
  const [word, setWord] = useState('');
  const [actionType, setActionType] = useState<'blur' | 'hide' | null>(null);
  const [scope, setScope] = useState<'all' | 'first' | null>(null);
  
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: upload/lang/word, 2: action, 3: scope, 4: processing, 5: done/preview
  const [loading, setLoading] = useState(false);
  const [resultHtml, setResultHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [pdfFormat, setPdfFormat] = useState('a4');
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResultHtml(null);
    setErrorMsg(null);
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);
    setStep(4);
    setResultHtml(null);
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docLang", docLang);
    formData.append("word", word);
    formData.append("actionType", actionType || 'hide');
    formData.append("scope", scope || 'all');

    try {
      const res = await fetch("/api/redact-doc", {
        method: "POST",
headers: { ...(localStorage.getItem('gemini_api_key') ? { "x-gemini-api-key": localStorage.getItem('gemini_api_key')! } : {}) }, body: formData,
      });
      const data = await res.json();
      if (res.ok && data.content) {
        const cleanHtml = data.content.replace(/```html/g, '').replace(/```/g, '').trim();
        setResultHtml(cleanHtml);
        setStep(5);
      } else {
        setErrorMsg(data.error || "Failed to redact document. Please try again.");
        setStep(3);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message === "Failed to fetch" 
        ? "Network Error (Timeout): The document may be too large. Processing is limited to 60 seconds. Try a smaller file (1-2 pages)." 
        : (err.message || "Network error. Please try again."));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const downloadHtmlAsPdf = async () => {
      if (!resultRef.current) return;
      
      try {
        const canvas = await html2canvas(resultRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
           orientation: 'p',
           unit: 'pt',
           format: pdfFormat
        });
        
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        let imgHeightInPdf = (canvas.height * pageWidth) / canvas.width;
        let imgWidthInPdf = pageWidth;
        
        const targetTotalHeight = pageHeight * pageCount;
        
        if (imgHeightInPdf > targetTotalHeight) {
            const ratio = targetTotalHeight / imgHeightInPdf;
            imgHeightInPdf = targetTotalHeight;
            imgWidthInPdf = imgWidthInPdf * ratio;
        }
        
        const xOffset = (pageWidth - imgWidthInPdf) / 2;
        
        let heightLeft = imgHeightInPdf;
        let position = 0;

        pdf.addImage(imgData, 'PNG', xOffset, position, imgWidthInPdf, imgHeightInPdf);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', xOffset, position, imgWidthInPdf, imgHeightInPdf);
            heightLeft -= pageHeight;
        }
        
        pdf.save('redacted_document.pdf');
      } catch (error) {
        console.error("PDF generation failed", error);
        alert("Error downloading PDF");
      }
  };

  const reset = () => {
    setFile(null);
    setWord('');
    setActionType(null);
    setScope(null);
    setResultHtml(null);
    setErrorMsg(null);
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
          Hide or blur any specific word or number in your PDF document. Very useful for redacting sensitive information like passwords or account numbers.
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

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm font-medium">
             Error: {errorMsg}
          </div>
        )}

        <div className="max-w-xl mx-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Upload PDF & Select Text</h3>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Document Language</label>
                <select 
                  value={docLang} 
                  onChange={e => setDocLang(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>

              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl h-48 flex flex-col items-center justify-center p-8 transition-colors"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf,image/*" 
                    className="hidden" 
                  />
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                  <h3 className="text-md font-medium text-slate-900 mb-1">Select PDF or Image</h3>
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

              {fileUrl && (
                <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                  <div className="bg-slate-200 p-2 text-xs font-semibold text-slate-600 flex justify-center items-center gap-2">
                      <Eye className="w-4 h-4" /> Original Document Preview 
                  </div>
                  <div className="p-4 flex justify-center max-h-[400px] overflow-auto">
                    {file?.type.startsWith('image/') ? (
                        <img src={fileUrl} alt="Preview" className="max-w-full h-auto shadow-sm" />
                    ) : (
                        <div className="w-full h-[400px] relative">
                          <iframe src={fileUrl} className="w-full h-full border-0" title="PDF Preview" />
                          <div className="absolute inset-0 pointer-events-none border border-slate-200" />
                        </div>
                    )}
                  </div>
                </div>
              )}

              {file && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Text or Number to blur/hide:</label>
                    <input
                      type="text"
                      value={word}
                      onChange={e => setWord(e.target.value)}
                      placeholder="e.g.: 1234567890 or John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!word.trim()}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Next Step
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Choose Action</h3>
              <p className="text-center text-slate-500 mb-8">What do you want to do with the text "{word}"?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setActionType('blur'); setStep(3); }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all gap-4 group"
                >
                  <div className="text-3xl filter blur-[4px] group-hover:blur-[6px] transition-all overflow-hidden relative">
                    <span className="opacity-0">BLUR</span>
                    <span className="absolute inset-0 bg-slate-300 rounded overflow-hidden flex items-center justify-center text-transparent">BLUR</span>
                  </div>
                  <span className="font-medium text-slate-700">Blur Word/Number</span>
                </button>
                <button 
                  onClick={() => { setActionType('hide'); setStep(3); }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-2xl hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all gap-4 flex-shrink-0"
                >
                  <div className="w-16 h-8 bg-slate-900 rounded inline-flex items-center justify-center overflow-hidden"></div>
                  <span className="font-medium">Blackout (Hide)</span>
                </button>
              </div>
              <button onClick={() => setStep(1)} className="text-blue-600 text-sm font-medium hover:underline w-full text-center mt-4">Back</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-xl font-semibold text-center text-slate-800">Select Scope</h3>
              <p className="text-center text-slate-500 mb-8">Where do you want to {actionType === 'blur' ? 'blur' : 'hide'} the text "{word}"?</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setScope('first'); processFile(); }}
                  className="p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="font-semibold text-lg text-slate-800 mb-1">First Instance Only</div>
                  <p className="text-slate-500 text-sm">Only {actionType === 'blur' ? 'blur' : 'hide'} the very first time this word or number appears in the file.</p>
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
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Processing Document...</h3>
                <p className="text-slate-500">Searching for '{word}', applying {actionType} to {scope === 'all' ? 'all instances' : 'first instance'}. This might take a minute.</p>
              </div>
            </div>
          )}

          {step === 5 && !resultHtml && (
             <div className="text-center py-8">
                <h3 className="text-xl text-red-600 mb-4">Processing Error</h3>
                <button onClick={() => setStep(3)} className="text-blue-600 hover:underline">Try Again</button>
             </div>
          )}
        </div>
      </div>

      {step === 5 && resultHtml && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-500 mb-12" id="redacted-doc">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Eye className="w-5 h-5 text-blue-600" /> Preview Redacted Document
            </h3>
            <button onClick={reset} className="text-sm font-medium text-slate-500 hover:text-slate-800">Start Over</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Download Page Format</label>
               <select value={pdfFormat} onChange={(e)=>setPdfFormat(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border">
                  <option value="a4">A4 Size</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Number of Pages to Fit</label>
               <input type="number" min="1" max="50" value={pageCount} onChange={(e)=>setPageCount(parseInt(e.target.value) || 1)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border" />
             </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <button 
               onClick={downloadHtmlAsPdf}
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 disabled:bg-blue-300"
            >
               <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <div className="overflow-auto bg-white border border-slate-200 p-8 rounded-xl shadow-inner min-h-[500px]" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div ref={resultRef} className="document-render bg-white" dangerouslySetInnerHTML={{ __html: resultHtml }} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload and Target</h4>
              <p className="text-slate-600 text-sm mt-1">Select document language, upload your PDF file and type the exact text or number you want to hide (e.g. your account number or name).</p>
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
              <p className="text-slate-600 text-sm mt-1">Decide if you want to apply the redaction everywhere in the file or just the first time it appears. Preview the result and download!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
