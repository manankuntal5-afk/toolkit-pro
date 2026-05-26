import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileType2, Play, Download, Languages, Eye } from 'lucide-react';
import { cn } from './Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DocumentTranslator() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [pdfFormat, setPdfFormat] = useState('a4');
  const [pageCount, setPageCount] = useState(1);
  const [translating, setTranslating] = useState(false);
  const [resultHtml, setResultHtml] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultHtml(null);
      setErrorMsg(null);
    }
  };

  const handleTranslate = async () => {
    if (!file) return;
    setTranslating(true);
    setResultHtml(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceLang", sourceLang);
    formData.append("targetLang", targetLang);

    try {
      const res = await fetch("/api/translate-doc", {
        method: "POST",
headers: { ...(localStorage.getItem('gemini_api_key') ? { "x-gemini-api-key": localStorage.getItem('gemini_api_key')! } : {}) }, body: formData,
      });
      const data = await res.json();
      if (res.ok && data.translation) {
        // Remove markdown formatting if the model still outputs it
        const cleanHtml = data.translation.replace(/```html/g, '').replace(/```/g, '').trim();
        setResultHtml(cleanHtml);
      } else {
        setErrorMsg(data.error || "Failed to translate document. It might be too large or complex.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message === "Failed to fetch" 
        ? "Network Error (Timeout): The document may be too large. Processing is limited to 60 seconds. Try a smaller file (1-2 pages)." 
        : (err.message || "Network error translating document. Please try again."));
    } finally {
      setTranslating(false);
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
        
        // Calculate the height the image would have if it took the full page width
        let imgHeightInPdf = (canvas.height * pageWidth) / canvas.width;
        let imgWidthInPdf = pageWidth;
        
        // If user wants to force it to specific page count, we might need to scale it down further
        // so that total height <= pageHeight * pageCount
        const targetTotalHeight = pageHeight * pageCount;
        
        if (imgHeightInPdf > targetTotalHeight) {
            // Scale it down to fit the requested number of pages
            const ratio = targetTotalHeight / imgHeightInPdf;
            imgHeightInPdf = targetTotalHeight;
            imgWidthInPdf = imgWidthInPdf * ratio;
        }
        
        // Center horizontally
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
        
        pdf.save('translated_document.pdf');
      } catch (error) {
        console.error("PDF generation failed", error);
        alert("Error downloading PDF");
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Languages className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Format-Preserving Document Translator</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Upload an official document (PDF/Image) and translate it while preserving its layout, tables, and stamps.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Original Language</label>
             <select value={sourceLang} onChange={(e)=>setSourceLang(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Translate To</label>
             <select value={targetLang} onChange={(e)=>setTargetLang(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border">
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
             </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Download Format</label>
             <select value={pdfFormat} onChange={(e)=>setPdfFormat(e.target.value)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border">
                <option value="a4">A4 Size</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Original Document Pages</label>
             <input type="number" min="1" max="50" value={pageCount} onChange={(e)=>setPageCount(parseInt(e.target.value) || 1)} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border" />
           </div>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 mb-6",
            file ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 bg-slate-50"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,image/*"
            className="hidden"
          />
          {file ? (
            <div className="space-y-2">
              <FileType2 className="w-10 h-10 text-blue-500 mx-auto" />
              <p className="text-sm font-medium text-blue-900">{file.name}</p>
              <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">Click to upload Document (PDF/Image)</p>
              <p className="text-xs text-slate-500">Max size 10MB</p>
            </div>
          )}
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm font-medium">
             Error: {errorMsg}
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
                     <p className="text-center text-xs text-slate-500 mt-2">If preview doesn't load, right click to open in new tab or ensure it is an image/standard PDF.</p>
                  </div>
               )}
             </div>
           </div>
        )}

        <button
          onClick={handleTranslate}
          disabled={!file || translating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {translating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {translating ? 'Translating Document...' : 'Translate Document'}
        </button>
      </div>

      {resultHtml && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200" id="translated-doc">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Translated Document</h3>
            <button onClick={downloadHtmlAsPdf} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF/Print
            </button>
          </div>
          <div className="overflow-auto bg-white border border-slate-200 p-8 rounded-xl shadow-inner min-h-[500px]" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div ref={resultRef} className="document-render bg-white" dangerouslySetInnerHTML={{ __html: resultHtml }} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Select Languages</h4>
              <p className="text-slate-600 text-sm mt-1">Choose the original language of the document and the language you want to translate it to.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Document</h4>
              <p className="text-slate-600 text-sm mt-1">Upload your official PDF or Image document.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Translate & Download</h4>
              <p className="text-slate-600 text-sm mt-1">Click translate. The tool will generate a translated document preserving the tables, formatting, and stamps. Click Export/Print to save it as a PDF.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
