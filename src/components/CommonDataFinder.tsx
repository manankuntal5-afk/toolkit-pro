import React, { useState } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Search,
  Download,
  FileType2,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "./Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FileData {
  fileName: string;
  data: any[];
  headers: string[];
}

interface CommonMatch {
  matchValue: string;
  count: number;
}

export default function CommonDataFinder() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [fileDataArray, setFileDataArray] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);

  // Since columns might differ per file, the user selects which column to match for EACH file individually
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const [commonMatches, setCommonMatches] = useState<CommonMatch[] | null>(
    null,
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []) as File[];
    if (selected.length < 2) {
      alert("Please upload at least 2 files.");
      return;
    }

    setFiles(selected);
    setLoading(true);
    setCommonMatches(null);
    setSelectedColumns(Array(selected.length).fill(""));

    const parsedData: FileData[] = [];

    try {
      for (const file of selected) {
        let rawData: any[][] = [];
        if (file.name.endsWith(".csv")) {
          const text = await file.text();
          const res = Papa.parse(text, { header: false, skipEmptyLines: true });
          rawData = res.data as any[][];
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          }) as any[][];
        } else {
          alert(`Unsupported file type: ${file.name}`);
          continue;
        }

        let headerRowIdx = 0;
        let maxCols = 0;
        for (let i = 0; i < Math.min(rawData.length, 20); i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;
          const filledCols = row.filter((c) => String(c).trim() !== "").length;
          if (filledCols > maxCols) {
            maxCols = filledCols;
            headerRowIdx = i;
          }
        }

        const headers = rawData[headerRowIdx]
          ? rawData[headerRowIdx].map((c) => String(c).trim())
          : [];
        const cleanHeaders = headers.map((h, i) => (h ? h : `Column_${i + 1}`));

        const dataObjects = [];
        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;
          const obj: any = {};
          let hasData = false;
          cleanHeaders.forEach((h, colIdx) => {
            if (row[colIdx] !== undefined && row[colIdx] !== "") {
              hasData = true;
            }
            obj[h] = row[colIdx];
          });
          if (hasData) {
            dataObjects.push(obj);
          }
        }

        if (cleanHeaders.length > 0) {
          parsedData.push({
            fileName: file.name,
            data: dataObjects,
            headers: cleanHeaders.filter((h) => h && !h.startsWith("Column_")),
          });
        }
      }

      setFileDataArray(parsedData);
      // Pre-select first column for each file if exists
      const defaultCols = parsedData.map((fd) => {
        if (fd.headers.length > 0) return fd.headers[0];
        return "";
      });
      setSelectedColumns(defaultCols);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleColumnChange = (index: number, val: string) => {
    const newCols = [...selectedColumns];
    newCols[index] = val;
    setSelectedColumns(newCols);
  };

  const findCommon = () => {
    if (fileDataArray.length < 2) return;
    if (selectedColumns.some((c) => !c)) {
      alert("Please select a column for all files to match against.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Find common using the first file as base
      const baseColName = selectedColumns[0];
      const baseMap = new Map<string, { fileName: string; rowData: any }[]>();

      // Load base files into map (using lowercased, trimmed value)
      fileDataArray[0].data.forEach((row) => {
        const val = row[baseColName];
        if (val) {
          const key = String(val).trim().toLowerCase();
          if (!baseMap.has(key)) baseMap.set(key, []);
          baseMap
            .get(key)!
            .push({ fileName: fileDataArray[0].fileName, rowData: row });
        }
      });

      // Intersect with subsequent files
      for (let i = 1; i < fileDataArray.length; i++) {
        const currentFileName = fileDataArray[i].fileName;
        const currentColName = selectedColumns[i];

        const currentFileMap = new Map<
          string,
          { fileName: string; rowData: any }[]
        >();

        fileDataArray[i].data.forEach((row) => {
          const val = row[currentColName];
          if (val) {
            const key = String(val).trim().toLowerCase();
            if (!currentFileMap.has(key)) currentFileMap.set(key, []);
            currentFileMap
              .get(key)!
              .push({ fileName: currentFileName, rowData: row });
          }
        });

        // Remove from baseMap if not in current file, otherwise append rows
        for (const [key, rows] of baseMap.entries()) {
          if (!currentFileMap.has(key)) {
            baseMap.delete(key);
          } else {
            // Add current file rows to the tracking array
            const matchingRows = currentFileMap.get(key)!;
            for (let j = 0; j < matchingRows.length; j++) {
              rows.push(matchingRows[j]);
            }
          }
        }
      }

      const results: CommonMatch[] = [];
      baseMap.forEach((rows, key) => {
        // just get original casing from the first matched row's value
        const originalValue = rows[0].rowData[selectedColumns[0]];
        results.push({
          matchValue: String(originalValue),
          count: rows.length,
        });
      });

      results.sort((a, b) => b.count - a.count);

      setCommonMatches(results);
      setLoading(false);
    }, 10);
  };

  const handleDownloadCSV = () => {
    if (!commonMatches || commonMatches.length === 0) return;

    const headerName = selectedColumns[0] || "Common Value";
    const flatData = commonMatches.map((match) => ({
      [headerName]: match.matchValue,
      Count: match.count,
    }));
    const csv = Papa.unparse(flatData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveFile(blob, "common_data_matches.csv");
  };

  const handleDownloadExcel = () => {
    if (!commonMatches || commonMatches.length === 0) return;

    const headerName = selectedColumns[0] || "Common Value";
    const excelData = commonMatches.map((match) => ({
      [headerName]: match.matchValue,
      Count: match.count,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Common Matches");
    XLSX.writeFile(workbook, "common_data_matches.xlsx");
  };

  const handleDownloadPDF = () => {
    if (!commonMatches || commonMatches.length === 0) return;

    const headerName = selectedColumns[0] || "Common Value";
    const doc = new jsPDF("portrait");
    const body: any[][] = commonMatches.map((match, idx) => [
      idx + 1,
      match.matchValue,
      match.count,
    ]);

    autoTable(doc, {
      head: [["#", headerName, "Count"]],
      body: body,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("common_data_matches.pdf");
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
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <div className="bg-[#0eb2a8] rounded-xl w-full max-w-[900px] min-h-[300px] p-8 relative flex flex-col items-center justify-center cursor-pointer shadow-md hover:bg-[#0c9d94] transition-all duration-300 overflow-hidden mx-auto mb-8 group">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".csv, .xlsx, .xls"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
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
                fill="#0eb2a8"
                stroke="none"
                fontSize="10"
                fontWeight="bold"
              >
                FILES
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
              CHOOSE MULTIPLE FILES
            </div>
          </div>
          <p className="text-white text-[15px] mt-4 z-10 font-medium">
            Hold Ctrl/Cmd to select 2 or more files (CSV or Excel)
          </p>
        </div>

        {fileDataArray.length > 0 && (
          <div className="mb-8">
            <h4 className="font-semibold text-slate-700 mb-4 text-lg">
              Select Columns to Match:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {fileDataArray.map((fileInfo, index) => {
                const headers = fileInfo.headers || [];
                return (
                  <div
                    key={index}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center text-slate-700 font-medium mb-3">
                      <FileType2 className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate" title={fileInfo.fileName}>
                        {fileInfo.fileName}
                      </span>
                    </div>
                    <select
                      value={selectedColumns[index]}
                      onChange={(e) =>
                        handleColumnChange(index, e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="" disabled>
                        Select column...
                      </option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <button
              onClick={findCommon}
              disabled={loading || selectedColumns.some((c) => !c)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center w-full md:w-auto min-w-[250px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" /> Find Common Data
                </>
              )}
            </button>
          </div>
        )}

        {commonMatches !== null && (
          <div className="border-t border-slate-200 pt-8 mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
                Found {commonMatches.length} common values
              </h3>

              {commonMatches.length > 0 && (
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
              )}
            </div>

            {commonMatches.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto w-full md:w-1/2">
                <table className="w-full text-left bg-white text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-700 w-16">
                        #
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-700">
                        {selectedColumns[0] || "Common Value"}
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-700 text-right w-24">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commonMatches.slice(0, 100).map((match, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                          {i + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 border-l border-slate-50">
                          {match.matchValue}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-right border-l border-slate-50">
                          {match.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {commonMatches.length > 100 && (
                  <div className="p-3 text-center text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
                    Showing first 100 common matches. Please download to view
                    all {commonMatches.length} matches.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                No common data found. (Make sure you selected the correct
                matching columns).
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Files</h4>
              <p className="text-slate-600 text-sm mt-1">
                Select 2 or more files (CSV or Excel). Hold Ctrl/Cmd to select
                multiple files at the same time.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Select Columns</h4>
              <p className="text-slate-600 text-sm mt-1">
                From the dropdowns below each file, select the column you want
                to compare (like "Mobile Number" from file 1 and "Phone" from
                file 2).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Get Results & Download
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Click 'Find Common Data'. You will see a list of only those
                numbers or data points that are present in all the selected
                files. You can download this list as CSV, Excel, or PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
