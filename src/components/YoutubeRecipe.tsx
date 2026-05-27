import React, { useState } from "react";
import { ListChecks, Download, Play, Youtube } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function YoutubeRecipe() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extractRecipe = async () => {
    if (!url) return;
    setExtracting(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/youtube-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("gemini_api_key")
            ? { "x-gemini-api-key": localStorage.getItem("gemini_api_key")! }
            : {}),
        },
        body: JSON.stringify({ url, language }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setErrorMsg(data.error || "Failed to extract recipe.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Could not connect to server.");
    } finally {
      setExtracting(false);
    }
  };

  const downloadPdf = () => {
    if (!result || !result.ingredients) return;

    try {
      const doc = new jsPDF();
      const totalCost = result.ingredients.reduce(
        (total: number, item: any) =>
          total + (Number(item.estimatedPrice) || 0),
        0,
      );

      doc.setFontSize(16);
      doc.text(`Grocery List: ${result.recipeName}`, 14, 15);

      const tableBody = result.ingredients.map((item: any) => [
        item.item,
        item.quantity,
        `Rs. ${item.estimatedPrice}`,
      ]);

      autoTable(doc, {
        startY: 25,
        head: [["Shopping Item", "Quantity", "Est. Price (INR)"]],
        body: tableBody,
        foot: [["", "Total Estimated Cost:", `Rs. ${totalCost}`]],
        theme: "grid",
        headStyles: { fillColor: [220, 38, 38] }, // tailwind red-600
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] }, // tailwind slate-100, slate-900
      });

      doc.save(`${result.recipeName.slice(0, 15)}_grocery_list.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              YouTube Video URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 p-3 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Output Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 p-3 border bg-white"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <button
          onClick={extractRecipe}
          disabled={!url || extracting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {extracting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {extracting ? "Extracting Ingredients..." : "Extract Grocery List"}
        </button>
      </div>

      {result && result.ingredients && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {result.recipeName}
              </h3>
              <p className="text-sm text-slate-500">
                Checklist Ready for Shopping
              </p>
            </div>
            <button
              onClick={downloadPdf}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Download PDF List
            </button>
          </div>

          <div id="recipe-table-container" className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-sm font-semibold text-slate-600 w-10">
                    ✓
                  </th>
                  <th className="p-3 text-sm font-semibold text-slate-600">
                    Shopping Item
                  </th>
                  <th className="p-3 text-sm font-semibold text-slate-600">
                    Quantity
                  </th>
                  <th className="p-3 text-sm font-semibold text-slate-600 border-l border-slate-200">
                    Est. Price (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.ingredients.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                    </td>
                    <td className="p-3 font-medium text-slate-800 whitespace-pre-wrap">
                      {item.item}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-pre-wrap">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-slate-600 font-mono border-l border-slate-50 bg-slate-50/30">
                      ₹{item.estimatedPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                  <td colSpan={3} className="p-4 text-right text-slate-800">
                    Total Estimated Cost:
                  </td>
                  <td className="p-4 text-slate-800 font-mono">
                    ₹
                    {result.ingredients.reduce(
                      (total: number, item: any) =>
                        total + (Number(item.estimatedPrice) || 0),
                      0,
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Copy Video Link</h4>
              <p className="text-slate-600 text-sm mt-1">
                Copy the URL of the cooking recipe video from YouTube.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Extract Details</h4>
              <p className="text-slate-600 text-sm mt-1">
                Paste the link and our AI will watch/read the video details to
                extract every ingredient mentioned, translating it cleanly.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Download Shopping List
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Download the neat PDF checklist onto your phone. It includes
                checkboxes and estimated market prices so you can tick them off
                while shopping at the grocery store.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
