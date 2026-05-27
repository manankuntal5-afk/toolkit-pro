import React, { useState, useRef } from "react";
import {
  FileSearch,
  UploadCloud,
  FileType2,
  Play,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { cn } from "./Layout";

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
        headers: {
          ...(localStorage.getItem("gemini_api_key")
            ? { "x-gemini-api-key": localStorage.getItem("gemini_api_key")! }
            : {}),
        },
        body: formData,
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
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`Decoded Bank Statement`, 14, 20);

    const body = result.transactions.map((item: any) => [
      item.date || "-",
      item.amount || "-",
      item.originalRemark,
      item.decodedMeaning,
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [["Date", "Amount", "Complex Remark", "Simple Meaning (English)"]],
      body: body,
      columnStyles: {
        2: { cellWidth: 80 },
        3: { cellWidth: 100 },
      },
    });

    doc.save(`decoded_statement.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#2563eb] rounded-xl w-full max-w-[900px] min-h-[300px] p-8 relative flex flex-col items-center justify-center cursor-pointer shadow-md hover:bg-[#1d4ed8] transition-all duration-300 overflow-hidden group mx-auto mb-8"
        >
          {/* Dashed white inner border */}
          <div className="absolute inset-2 border-2 border-dashed border-white/40 pointer-events-none rounded-lg"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.csv,.txt"
            className="hidden"
          />

          <div className="mb-6 z-10 transform group-hover:scale-105 transition-transform duration-300">
            <svg
              width="72"
              height="72"
              viewBox="0 0 84 84"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M22 18v52h44V34L46 18H22z" strokeLinejoin="round" />
              <path d="M46 18v16h16" strokeLinejoin="round" />
              <rect
                x="34"
                y="44"
                width="20"
                height="12"
                rx="2"
                fill="white"
                stroke="none"
              />
              <text
                x="44"
                y="52"
                textAnchor="middle"
                fill="#2563eb"
                stroke="none"
                fontSize="10"
                fontWeight="bold"
              >
                FILE
              </text>
            </svg>
          </div>

          <div className="flex items-center shadow-lg rounded bg-white hover:bg-gray-50 h-[50px] text-[#1a1a1a] z-10 font-bold text-[16px] transform focus:scale-95 transition-transform">
            <div className="flex items-center px-6 h-full">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              CHOOSE FILE
            </div>
          </div>
          <p className="text-white text-[15px] mt-4 z-10 font-medium">
            Click to upload Bank Statement (PDF or CSV)
          </p>
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
          {decoding
            ? "Analyzing & Decoding Transcactions..."
            : "Decode Statement"}
        </button>
      </div>

      {result && result.transactions && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Decoded Transactions
              </h3>
              <p className="text-sm text-slate-500">
                Complex codes converted to simple language
              </p>
            </div>
            <button
              onClick={downloadPdf}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-sm font-semibold text-slate-600">
                    Date & Amt
                  </th>
                  <th className="p-3 text-sm font-semibold text-slate-600 w-1/3">
                    Original Complex Remark
                  </th>
                  <th className="p-3 text-sm font-semibold text-slate-600 border-l border-slate-200">
                    Decoded Meaning (English)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.transactions.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800 whitespace-nowrap">
                        {item.date}
                      </div>
                      <div className="text-sm font-bold text-slate-600">
                        {item.amount}
                      </div>
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
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Statement</h4>
              <p className="text-slate-600 text-sm mt-1">
                Upload your bank statement in PDF or Excel/CSV format securely.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Decode Data</h4>
              <p className="text-slate-600 text-sm mt-1">
                The AI will read the complex bank jargon (like UPI/xxxx/xxx/WDL)
                and instantly translate it to normal language so you can spot
                frauds easily.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Download Simplified PDF
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Export the simplified transaction list as a PDF for your records
                or tax filings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
