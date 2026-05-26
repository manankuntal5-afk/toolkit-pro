import React, { useState, useRef } from 'react';
import { FileSearch, UploadCloud, FileType2, Play, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from './Layout';

export default function BankDecoder() {
  const [file, setFile] = useState<File | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDecode = async () => {
    if (!file) return;
    setDecoding(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/decode-bank", {
        method: "POST",
        headers: { ...(localStorage.getItem('gemini_api_key') ? { "x-gemini-api-key": localStorage.getItem('gemini_api_key')! } : {}) }, body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error decoding bank statement.");
    } finally {
      setDecoding(false);
    }
  };

  const downloadPdf = () => {
     if (!result || !result.transactions) return;
     const doc = new jsPDF('landscape');
     doc.setFontSize(16);
     doc.text(`Decoded Bank Statement`, 14, 20);
     
     const body = result.transactions.map((item: any) => [
        item.date || '-', 
        item.amount || '-', 
        item.originalRemark, 
        item.decodedMeaning
     ]);
     
     (doc as any).autoTable({
        startY: 30,
        head: [['Date', 'Amount', 'Complex Remark', 'Simple Meaning (Hindi)']],
        body: body,
        columnStyles: {
           2: { cellWidth: 80 },
           3: { cellWidth: 100 }
        }
     });
     
     doc.save(`decoded_statement.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <FileSearch className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Bank Remarks & WDL Decoder</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Upload your bank statement (PDF/CSV). We decode complex WDL remarks, UPI routing codes, and transaction hashes into simple Hindi so you quickly understand where the money went.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 mb-6",
            file ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-slate-400 bg-slate-50"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.csv,.txt"
            className="hidden"
          />
          {file ? (
            <div className="space-y-2">
              <FileType2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-emerald-900">{file.name}</p>
              <p className="text-xs text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">Click to upload Bank Statement (PDF or CSV)</p>
              <p className="text-xs text-slate-500">Max size 20MB. Safe, read-only processing.</p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDecode}
          disabled={!file || decoding}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {decoding ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {decoding ? 'Analyzing & Decoding Transcactions...' : 'Decode Statement'}
        </button>
      </div>

      {result && result.transactions && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Decoded Transactions</h3>
              <p className="text-sm text-slate-500">Complex codes converted to simple language</p>
            </div>
            <button onClick={downloadPdf} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="p-3 text-sm font-semibold text-slate-600">Date & Amt</th>
                     <th className="p-3 text-sm font-semibold text-slate-600 w-1/3">Original Complex Remark</th>
                     <th className="p-3 text-sm font-semibold text-slate-600 border-l border-slate-200">Decoded Meaning (Simple Hindi/English)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {result.transactions.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-3">
                          <div className="font-medium text-slate-800 whitespace-nowrap">{item.date}</div>
                          <div className="text-sm font-bold text-slate-600">{item.amount}</div>
                       </td>
                       <td className="p-3 text-slate-500 font-mono text-xs break-all leading-relaxed">
                          {item.originalRemark}
                       </td>
                       <td className="p-3 text-emerald-800 font-medium border-l border-slate-50 bg-emerald-50/20">
                          {item.decodedMeaning}
                       </td>
                    </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Statement</h4>
              <p className="text-slate-600 text-sm mt-1">Upload your bank statement in PDF or Excel/CSV format securely.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Decode Data</h4>
              <p className="text-slate-600 text-sm mt-1">The AI will read the complex bank jargon (like UPI/xxxx/xxx/WDL) and instantly translate it to normal language so you can spot frauds easily.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Download Simplified PDF</h4>
              <p className="text-slate-600 text-sm mt-1">Export the simplified transaction list as a PDF for your records or tax filings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
