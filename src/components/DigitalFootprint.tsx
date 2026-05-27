import React, { useState } from "react";
import {
  Fingerprint,
  Search,
  ShieldAlert,
  Globe,
  AlertTriangle,
  Download,
  Printer,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DigitalFootprint() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async () => {
    if (!name && !email && !phone) return;
    setScanning(true);
    setResult(null);
    setErrorMsg(null);

    const body = { name, email, phone };

    try {
      const res = await fetch("/api/digital-footprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("gemini_api_key")
            ? { "x-gemini-api-key": localStorage.getItem("gemini_api_key")! }
            : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setErrorMsg(data.error || "Failed to scan digital footprint.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Could not connect to server.");
    } finally {
      setScanning(false);
    }
  };

  const downloadPdf = () => {
    if (!result || !result.findings) return;

    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Digital Footprint Report", 14, 15);

      doc.setFontSize(10);
      doc.text(
        `Name: ${name || "N/A"}, Email: ${email || "N/A"}, Phone: ${phone || "N/A"}`,
        14,
        22,
      );

      let currentY = 30;

      // Add Summary
      doc.setFontSize(12);
      doc.text("Summary", 14, currentY);
      currentY += 6;
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(
        result.summary || "No summary provided.",
        180,
      );
      doc.text(splitSummary, 14, currentY);
      currentY += splitSummary.length * 5 + 5;

      const tableBody = result.findings.map((f: any) => [
        f.platform || "Unknown",
        f.dataType || "-",
        f.riskLevel || "-",
        f.description || "-",
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Platform", "Data Type", "Risk Level", "Description"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [147, 51, 234] }, // tailwind purple-600
        styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
        columnStyles: {
          3: { cellWidth: 80 },
        },
      });

      doc.save(`Digital_Footprint_${name || email || "Report"}.pdf`);
    } catch (e) {
      console.error("PDF Generation error", e);
      alert("Error generating PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-slate-300 rounded-lg p-3 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border border-slate-300 rounded-lg p-3 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 2345678900"
              className="w-full border border-slate-300 rounded-lg p-3 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl text-purple-800 text-sm mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Privacy Notice:</strong> We do not store your data. This
            tool simply queries public search engines and directories to show
            you what information is already publicly available to anyone.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={(!name && !email && !phone) || scanning}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {scanning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {scanning
            ? "Scanning Public Domain OSINT..."
            : "Scan Digital Footprint"}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-4 gap-4">
              <h3 className="text-xl font-bold text-slate-800">Scan Summary</h3>
              <div className="flex items-center gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={downloadPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.findings &&
              result.findings.map((f: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <Globe className="w-5 h-5 text-purple-600" />
                        {f.platform}
                      </div>
                      {f.riskLevel === "High" && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> High Risk
                        </span>
                      )}
                      {f.riskLevel === "Medium" && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                          Medium Risk
                        </span>
                      )}
                      {f.riskLevel === "Low" && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                          Low Risk
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">
                      Data Found: {f.dataType}
                    </p>
                    <p className="text-sm text-slate-600">{f.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
