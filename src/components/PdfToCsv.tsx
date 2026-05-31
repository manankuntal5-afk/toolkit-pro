import React, { useState, useRef } from "react";
import {
  FileType2,
  MessageCircle,
  FileDown,
  Loader2,
  Table as TableIcon,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function PdfToCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState("");

  const [tableData, setTableData] = useState<string[][] | null>(null);
  const [extractingTable, setExtractingTable] = useState(false);

  // Chat state
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<{ q: string; a: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPdfText("");
    setTableData(null);
    setChatLog([]);
    setQuestion("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setLoading(true);
    setPdfText("");
    setTableData(null);
    setChatLog([]);
    setExtractingTable(true);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      // 1. Text Extraction (Fast)
      const textPromise = fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      // 2. Table Extraction (Direct from PDF via Gemini Native)
      const tablePromise = fetch("/api/extract-table-file", {
        method: "POST",
        body: formData,
      });

      // Wait for TEXT to finish so Chat gets unlocked quickly
      const textRes = await textPromise;
      const textData = await textRes.json();
      if (textRes.ok && textData.text) {
        setPdfText(textData.text);
      } else {
        alert(textData.error || "Failed to process the PDF document text.");
      }
      setLoading(false);

      // Meanwhile, wait for TABLE to finish
      try {
        const tableRes = await tablePromise;
        const tableResult = await tableRes.json();

        if (
          tableRes.ok &&
          tableResult.table &&
          Array.isArray(tableResult.table)
        ) {
          const normalized = tableResult.table.map((row: any) =>
            Array.isArray(row)
              ? row.map(String)
              : typeof row === "object" && row !== null
                ? Object.values(row).map(String)
                : [String(row)],
          );
          setTableData(normalized);
        } else {
          setTableData([
            ["Error"],
            [
              tableResult.error ||
                "No structured tabular data could be found in the document.",
            ],
          ]);
        }
      } catch (tableErr) {
        console.error(tableErr);
        setTableData([
          ["Error"],
          ["Failed to extract data table due to a network or server error."],
        ]);
      } finally {
        setExtractingTable(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading or processing PDF.");
      setLoading(false);
      setExtractingTable(false);
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const extractTableData = async () => {
    if (!file) return;
    setExtractingTable(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/extract-table-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.table && Array.isArray(data.table)) {
        const normalized = data.table.map((row: any) =>
          Array.isArray(row)
            ? row.map(String)
            : typeof row === "object" && row !== null
              ? Object.values(row).map(String)
              : [String(row)],
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
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "") || "ExtractedData"}.csv`;
    a.click();
  };

  const handleDownloadExcel = () => {
    if (!tableData) return;
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(
      wb,
      `${file?.name.replace(".pdf", "") || "ExtractedData"}.xlsx`,
    );
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !pdfText) return;

    const q = question;
    setQuestion("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText, question: q }),
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setChatLog((prev) => [...prev, { q, a: data.answer }]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { q, a: data.error || "Failed to get an answer." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        { q, a: "Error answering question. Network or server issue." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {!file ? (
        <div className="w-full flex items-center justify-center p-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#2563eb] rounded-xl w-full max-w-[900px] h-[340px] relative flex flex-col items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-[#1d4ed8] transition-all duration-300 overflow-hidden group"
          >
            {/* Dashed white inner border like smallpdf */}
            <div className="absolute inset-2 border-2 border-dashed border-white/40 pointer-events-none rounded-lg"></div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />

            {/* Custom SVG Icon for PDF in white */}
            <div className="mb-8 mt-2 transform group-hover:scale-105 transition-transform duration-300">
              <svg
                width="84"
                height="84"
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
                  PDF
                </text>
              </svg>
            </div>

            <div className="flex items-center shadow-lg rounded bg-white hover:bg-gray-50 h-[56px] text-[#1a1a1a] z-10 font-bold text-[18px] transform focus:scale-95 transition-transform">
              <div className="flex items-center px-6 h-full cursor-pointer">
                <svg
                  className="w-5 h-5 mr-3"
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
                CHOOSE FILES
              </div>
              <div className="border-l border-gray-200 h-full flex items-center justify-center px-4 hover:bg-gray-100 cursor-pointer rounded-r">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-white text-[16px] mt-6 z-10 font-medium">
              or drop files here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <FileType2 className="w-8 h-8 text-[#e5322d]" />
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a] truncate max-w-[200px]">
                  {file.name}
                </h3>
                <p className="text-[#4a4a4a] text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetState}
              className="text-[#e5322d] hover:underline font-bold text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="flex-1 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Loader2 className="w-10 h-10 text-[#006fff] animate-spin mb-4" />
                <p className="text-[#1a1a1a] font-bold text-lg">
                  Extracting Data...
                </p>
                <p className="text-[#4a4a4a] text-sm">
                  Please wait while we process the document.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {!tableData ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-[300px]">
                    {extractingTable ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-[#006fff] animate-spin mx-auto mb-3" />
                        <p className="text-[#1a1a1a] font-bold">
                          Scanning for Tables...
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={extractTableData}
                        className="px-6 py-3 bg-[#006fff] text-white rounded-full font-bold hover:bg-[#005cde] transition-colors"
                      >
                        Extract Structured Tables
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[#1a1a1a]">
                        Extracted Tables
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadCSV}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1a1a1a] rounded-lg text-sm font-bold transition-colors"
                        >
                          <FileDown className="w-4 h-4" /> CSV
                        </button>
                        <button
                          onClick={handleDownloadExcel}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#006fff] hover:bg-[#005cde] text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          <FileDown className="w-4 h-4" /> Excel
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-auto h-[250px]">
                      <table className="w-full text-sm text-left text-[#4a4a4a] min-w-max">
                        <thead className="bg-gray-50 text-[#1a1a1a] sticky top-0">
                          <tr>
                            {Array.isArray(tableData) &&
                              tableData.length > 0 &&
                              (Array.isArray(tableData[0])
                                ? tableData[0]
                                : typeof tableData[0] === "object" &&
                                    tableData[0] !== null
                                  ? Object.values(tableData[0])
                                  : [String(tableData[0])]
                              ).map((h, i) => (
                                <th
                                  key={i}
                                  className="px-4 py-3 border-b border-gray-200 font-bold whitespace-nowrap"
                                >
                                  {typeof h === "object"
                                    ? JSON.stringify(h)
                                    : String(h)}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(tableData) &&
                            tableData.slice(1).map((row, rI) => {
                              const cells = Array.isArray(row)
                                ? row
                                : typeof row === "object" && row !== null
                                  ? Object.values(row)
                                  : [String(row)];
                              return (
                                <tr
                                  key={rI}
                                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                >
                                  {cells.map((cell, cI) => (
                                    <td
                                      key={cI}
                                      className="px-4 py-3 whitespace-nowrap"
                                    >
                                      {typeof cell === "object"
                                        ? JSON.stringify(cell)
                                        : String(cell)}
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
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden min-h-[400px]">
          <div className="bg-[#fafafa] border-b border-gray-200 p-5">
            <h3 className="font-bold text-[#1a1a1a] flex items-center gap-2">
              Ask PDF AI
            </h3>
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[300px]">
            {chatLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#4a4a4a] text-center px-4">
                Ask questions to extract summaries or specific data from the PDF
                instantly.
              </div>
            ) : (
              <div className="space-y-4">
                {chatLog.map((chat, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                        U
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-[#1a1a1a] text-sm">
                        {chat.q}
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-[#006fff] text-white flex items-center justify-center font-bold text-xs">
                        AI
                      </div>
                      <div className="bg-[#006fff] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                        {chat.a}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#006fff] text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div className="bg-[#006fff] text-white rounded-2xl rounded-tr-sm px-5 py-3 h-10 w-16 flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleAskQuestion}
            className="p-4 border-t border-gray-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Need a summary? Just ask..."
              disabled={!pdfText || chatLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006fff] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!pdfText || chatLoading || !question}
              className="bg-[#006fff] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005cde] disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload PDF</h4>
              <p className="text-slate-600 text-sm mt-1">
                Drag and drop your PDF file into the upload area or click to select a file from your device.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Extract Tables</h4>
              <p className="text-slate-600 text-sm mt-1">
                Wait for the tool to automatically scan and extract tabular data. You can then download it as CSV or Excel.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Chat with PDF</h4>
              <p className="text-slate-600 text-sm mt-1">
                Use the AI chat interface to ask specific questions about the document or request summaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
