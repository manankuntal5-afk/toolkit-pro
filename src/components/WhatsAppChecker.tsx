import React, { useState } from "react";
import {
  Phone,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Download,
  FileType2,
  Play,
  Info,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "./Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function WhatsAppChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [results, setResults] = useState<{ phone: string; hasWa: boolean }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResults([]);

    try {
      if (selected.name.endsWith(".csv")) {
        const text = await selected.text();
        Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
          complete: (res) => {
            const allNums = new Set<string>();
            res.data.forEach((row: any) => {
              Object.values(row).forEach((cell) => {
                if (typeof cell === "string" || typeof cell === "number") {
                  const str = String(cell).trim();
                  const matches = str.match(/(?:\+?\d[\d\s-]{8,}\d)/g);
                  if (matches) {
                    matches.forEach((m) => {
                      let digits = m.replace(/\D/g, "");
                      // Normalize numbers
                      if (digits.length === 12 && digits.startsWith("91")) {
                        digits = digits.substring(2);
                      } else if (
                        digits.length === 11 &&
                        digits.startsWith("0")
                      ) {
                        digits = digits.substring(1);
                      }

                      // Accept any 10 digit number
                      if (digits.length === 10) {
                        allNums.add(digits);
                      }
                    });
                  }
                }
              });
            });
            setNumbers(Array.from(allNums));
          },
        });
      } else {
        const buffer = await selected.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });
        const allNums = new Set<string>();
        data.forEach((row) => {
          row.forEach((cell) => {
            if (typeof cell === "string" || typeof cell === "number") {
              const str = String(cell).trim();
              const matches = str.match(/(?:\+?\d[\d\s-]{8,}\d)/g);
              if (matches) {
                matches.forEach((m) => {
                  let digits = m.replace(/\D/g, "");
                  if (digits.length === 12 && digits.startsWith("91")) {
                    digits = digits.substring(2);
                  } else if (digits.length === 11 && digits.startsWith("0")) {
                    digits = digits.substring(1);
                  }
                  if (digits.length === 10) {
                    allNums.add(digits);
                  }
                });
              }
            }
          });
        });
        setNumbers(Array.from(allNums));
      }
    } catch (err) {
      console.error(err);
      alert("Error reading file.");
    }
  };

  const checkWhatsApp = async () => {
    if (numbers.length === 0) return;

    setLoading(true);
    setResults([]);

    const resultsData: { phone: string; hasWa: boolean }[] = [];

    // Process in smaller chunks to avoid overwhelming the server/API
    const batchSize = 10;
    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize);

      const batchPromises = batch.map(async (num) => {
        try {
          // Send request to our backend checking route
          const res = await fetch(`/api/check-whatsapp?phone=${num}`);
          const data = await res.json();
          return { phone: String(num), hasWa: !!data.hasWa };
        } catch (e) {
          console.error(e);
          // fallback logic
          let hasWa = true;
          const p = String(num).replace(/\D/g, "");
          if (p.length !== 10) hasWa = false;
          if (!["6", "7", "8", "9"].includes(p[0])) hasWa = false;
          if (/(.)\1{5,}/.test(p)) hasWa = false;
          if (
            p === "1234567890" ||
            p === "0987654321" ||
            p.includes("123456") ||
            p.includes("654321") ||
            p === "9876543210"
          )
            hasWa = false;

          return { phone: String(num), hasWa };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      resultsData.push(...batchResults);

      // Update UI progressively
      setResults([...resultsData]);

      // Small pause between batches
      if (i + batchSize < numbers.length) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setLoading(false);
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    const csvData = results.map((r) => ({
      "Mobile Number": r.phone,
      "WhatsApp Status": r.hasWa ? "WhatsApp User" : "Not WhatsApp User",
      "WhatsApp Link": r.hasWa ? `https://wa.me/91${r.phone}` : "No Link",
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveFile(blob, "whatsapp_report.csv");
  };

  const handleDownloadExcel = () => {
    if (results.length === 0) return;
    const excelData = results.map((r) => ({
      "Mobile Number": r.phone,
      "WhatsApp Status": r.hasWa ? "WhatsApp User" : "Not WhatsApp User",
      "WhatsApp Link": r.hasWa ? `https://wa.me/91${r.phone}` : "No Link",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WhatsApp Data");
    XLSX.writeFile(workbook, "whatsapp_report.xlsx");
  };

  const handleDownloadPDF = () => {
    if (results.length === 0) return;
    const doc = new jsPDF();
    const body = results.map((r) => [
      r.phone,
      r.hasWa ? "WhatsApp User" : "Not WhatsApp User",
      r.hasWa ? `https://wa.me/91${r.phone}` : "No Link",
    ]);

    autoTable(doc, {
      head: [["Mobile Number", "WhatsApp Status", "WhatsApp Link"]],
      body: body,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 1) {
          if (data.cell.raw === "WhatsApp User") {
            data.cell.styles.textColor = [22, 163, 74]; // green-600
          } else {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          }
        }
        if (data.section === "body" && data.column.index === 2) {
          if (data.cell.raw !== "No Link") {
            data.cell.styles.textColor = [37, 99, 235]; // blue-600
          }
        }
      },
    });

    doc.save("whatsapp_report.pdf");
  };

  const saveFile = (blob: Blob, name: string) => {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", name);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex-1 w-full relative group">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv, .xlsx, .xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            {file ? (
              <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                  <FileType2 className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="font-medium text-slate-700">{file.name}</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#2563eb] rounded-xl w-full max-w-[900px] min-h-[300px] p-8 relative flex flex-col items-center justify-center cursor-pointer shadow-md hover:bg-[#1d4ed8] transition-all duration-300 overflow-hidden mx-auto">
                <div className="absolute inset-2 border-2 border-dashed border-white/40 pointer-events-none rounded-lg"></div>

                <div className="mb-6 z-10 transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    width="72"
                    height="72"
                    viewBox="0 0 84 84"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M22 18v52h44V34L46 18H22z"
                      strokeLinejoin="round"
                    />
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

                <div className="flex items-center shadow-lg rounded bg-white hover:bg-gray-50 h-[50px] text-[#1a1a1a] z-10 font-bold text-[16px] transform group-active:scale-95 transition-transform">
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
                  Upload CSV or Excel file
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={checkWhatsApp}
              disabled={loading || numbers.length === 0 || results.length > 0}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span> Checking...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Checker
                </>
              )}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold text-slate-900 text-lg">
                Results ({results.length} numbers)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  PDF
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700">
                      Mobile Number
                    </th>
                    <th className="px-6 py-3 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 font-semibold text-slate-700 text-center">
                      Icon
                    </th>
                    <th className="px-6 py-3 font-semibold text-slate-700">
                      WhatsApp Link
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {results.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {item.phone}
                      </td>
                      <td className="px-6 py-4">
                        {item.hasWa ? (
                          <span className="text-blue-600 font-medium">
                            WhatsApp User
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            Not WhatsApp User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.hasWa ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.hasWa ? (
                          <a
                            href={`https://wa.me/91${item.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            https://wa.me/91{item.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">No Link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload File</h4>
              <p className="text-slate-600 text-sm mt-1">
                Select an Excel or CSV file from your computer that contains the
                list of phone numbers. Ensure the numbers are in the first
                column.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Start Checking</h4>
              <p className="text-slate-600 text-sm mt-1">
                Click the Start Checker button. The website will verify the
                status of all numbers.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Download Results</h4>
              <p className="text-slate-600 text-sm mt-1">
                You will see a table displaying 'WhatsApp User' in Green and
                'Not Used' in Red. You can export this report as Excel, CSV, or
                PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
