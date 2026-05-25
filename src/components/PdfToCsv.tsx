import React, { useState, useRef } from 'react';
import { FileType2, UploadCloud, MessageCircle, FileDown, Loader2, Table as TableIcon, RefreshCw, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function PdfToCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState('');
  
  const [tableData, setTableData] = useState<string[][] | null>(null);
  const [extractingTable, setExtractingTable] = useState(false);

  // Chat state
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPdfText('');
    setTableData(null);
    setChatLog([]);
    setQuestion('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setLoading(true);
    setPdfText('');
    setTableData(null);
    setChatLog([]);
    setExtractingTable(true);
    
    const formData = new FormData();
    formData.append('file', selected);
    
    try {
      // 1. Text Extraction (Fast)
      const textPromise = fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });

      // 2. Table Extraction (Direct from PDF via Gemini Native)
      const tablePromise = fetch('/api/extract-table-file', {
        method: 'POST',
        body: formData
      });

      // Wait for TEXT to finish so Chat gets unlocked quickly
      const textRes = await textPromise;
      const textData = await textRes.json();
      if(textRes.ok && textData.text) {
        setPdfText(textData.text);
      } else {
        alert(textData.error || "Failed to process the PDF document text.");
      }
      setLoading(false);

      // Meanwhile, wait for TABLE to finish
      try {
        const tableRes = await tablePromise;
        const tableResult = await tableRes.json();
        
        if (tableRes.ok && tableResult.table && Array.isArray(tableResult.table)) {
          const normalized = tableResult.table.map((row: any) => 
             Array.isArray(row) ? row.map(String) : (typeof row === 'object' && row !== null ? Object.values(row).map(String) : [String(row)])
          );
          setTableData(normalized);
        } else {
          setTableData([["Error"], [tableResult.error || "No structured tabular data could be found in the document."]]);
        }
      } catch (tableErr) {
        console.error(tableErr);
        setTableData([["Error"], ["Failed to extract data table due to a network or server error."]]);
      } finally {
        setExtractingTable(false);
      }

    } catch (err) {
      console.error(err);
      alert("Error uploading or processing PDF.");
      setLoading(false);
      setExtractingTable(false);
    }
    
    // Clear input so same file can be uploaded again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const extractTableData = async () => {
    if (!file) return;
    setExtractingTable(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/extract-table-file', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.table && Array.isArray(data.table)) {
        const normalized = data.table.map((row: any) => 
            Array.isArray(row) ? row.map(String) : (typeof row === 'object' && row !== null ? Object.values(row).map(String) : [String(row)])
        );
        setTableData(normalized);
      } else {
        alert(data.error || "Failed to extract structured data from this PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to extract data table due to a network or server error.");
    } finally {
      setExtractingTable(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!tableData) return;
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'ExtractedData'}.csv`;
    a.click();
  };

  const handleDownloadExcel = () => {
    if (!tableData) return;
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${file?.name.replace('.pdf', '') || 'ExtractedData'}.xlsx`);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !pdfText) return;
    
    const q = question;
    setQuestion('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/chat-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pdfText, question: q })
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setChatLog(prev => [...prev, { q, a: data.answer }]);
      } else {
        setChatLog(prev => [...prev, { q, a: data.error || "Failed to get an answer." }]);
      }
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { q, a: "Error answering question. Network or server issue." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-sm pb-1">
          <FileType2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">PDF to CSV & Excel + AI Chat</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Upload PDF files to automatically extract tabular data into Excel/CSV and chat with an AI regarding its content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Upload & Convert Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full min-h-[450px]">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 cursor-pointer rounded-2xl w-full flex-1 flex flex-col items-center justify-center p-8 transition-colors"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf" 
                className="hidden" 
              />
              <UploadCloud className="w-14 h-14 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload PDF File</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">Click or drag file here (Max 200MB)</p>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-colors shadow-sm">
                Select File
              </button>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col">
              {loading ? (
                 <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Extracting text & analyzing structure... This takes a moment.</p>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 text-center bg-white relative">
                    <button 
                      onClick={resetState}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                      title="Upload Another File"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <FileType2 className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 truncate px-4">{file.name}</h3>
                    <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    {!tableData ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        {extractingTable ? (
                          <div className="text-center p-8">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                            <p className="text-slate-600 text-sm font-medium">Extracting data into a table...</p>
                          </div>
                        ) : (
                          <button 
                            onClick={extractTableData}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                          >
                            <TableIcon className="w-5 h-5" />
                            Extract Table from PDF
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                             Extracted Data Preview
                             {extractingTable && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                          </h4>
                          <div className="flex gap-2">
                             <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-sm font-medium transition-colors border border-green-200 shadow-sm">
                               <FileDown className="w-4 h-4" /> CSV
                             </button>
                             <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                               <FileDown className="w-4 h-4" /> Excel
                             </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto border border-slate-200 rounded-lg bg-white shadow-inner relative" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '300px' }}>
                          <table className="w-full text-sm text-left text-slate-600 min-w-max">
                            <thead className="bg-slate-100 text-slate-800 sticky top-0 z-10 shadow-sm">
                              <tr>
                                {Array.isArray(tableData) && tableData.length > 0 && 
                                  (Array.isArray(tableData[0]) ? tableData[0] : (typeof tableData[0] === 'object' && tableData[0] !== null ? Object.values(tableData[0]) : [String(tableData[0])]))
                                  .map((h, i) => (
                                    <th key={i} className="px-4 py-3 border-b-2 border-slate-200 font-semibold whitespace-nowrap">
                                        {typeof h === 'object' ? JSON.stringify(h) : String(h)}
                                    </th>
                                  ))
                                }
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(tableData) && tableData.slice(1).map((row, rI) => {
                                // If row is not an array, convert object to array of its values
                                const cells = Array.isArray(row) ? row : (typeof row === 'object' && row !== null ? Object.values(row) : [String(row)]);
                                return (
                                <tr key={rI} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                  {cells.map((cell, cI) => (
                                    <td key={cI} className="px-4 py-2 whitespace-nowrap">
                                      {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                                    </td>
                                  ))}
                                </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Chat Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[450px]">
          <div className="bg-slate-50 border-b border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Chat with PDF Document
            </h3>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
            {chatLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-8">
                After uploading a PDF, ask questions to quickly extract details or summarize sections without reading it yourself.
              </div>
            ) : (
              <div className="space-y-6">
                {chatLog.map((chat, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 text-sm font-bold shadow-sm">U</div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-800 shadow-sm text-sm">
                        {chat.q}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 text-sm font-bold shadow-sm">AI</div>
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm whitespace-pre-wrap leading-relaxed">
                        {chat.a}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3 flex-row-reverse">
                     <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 text-sm font-bold shadow-sm">AI</div>
                     <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm flex items-center h-10 w-16">
                       <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleAskQuestion} className="p-4 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10 flex gap-3">
            <input 
              type="text" 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDF..."
              disabled={!pdfText || chatLoading}
              className="flex-1 px-5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-slate-800 shadow-sm"
            />
            <button 
              type="submit" 
              disabled={!pdfText || chatLoading || !question}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
