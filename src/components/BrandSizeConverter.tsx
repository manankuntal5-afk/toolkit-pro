import React, { useState } from "react";
import { Shirt, Play } from "lucide-react";

export default function BrandSizeConverter() {
  const [category, setCategory] = useState("T-Shirts & Tops");

  const [selectedCurrentBrand, setSelectedCurrentBrand] = useState("Puma");
  const [currentBrandText, setCurrentBrandText] = useState("");

  const [currentSize, setCurrentSize] = useState("M (32, 8)");

  const [selectedTargetBrand, setSelectedTargetBrand] = useState("Nike");
  const [targetBrandText, setTargetBrandText] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const POPULAR_BRANDS = [
    "Adidas",
    "H&M",
    "Levi's",
    "Nike",
    "Puma",
    "Reebok",
    "Under Armour",
    "Uniqlo",
    "Zara",
    "Other",
  ];

  const sizeOptions =
    category === "Shoes"
      ? [
          "UK 5 (US 6 / EU 39)",
          "UK 6 (US 7 / EU 40)",
          "UK 7 (US 8 / EU 41)",
          "UK 8 (US 9 / EU 42)",
          "UK 9 (US 10 / EU 43)",
          "UK 10 (US 11 / EU 44)",
          "UK 11 (US 12 / EU 45)",
          "UK 12 (US 13 / EU 46)",
        ]
      : category === "Jeans & Trousers"
        ? [
            '28 (Waist 28")',
            '30 (Waist 30")',
            '32 (Waist 32")',
            '34 (Waist 34")',
            '36 (Waist 36")',
            '38 (Waist 38")',
            '40 (Waist 40")',
            '42 (Waist 42")',
          ]
        : [
            "XS (28, 4)",
            "S (30, 6)",
            "M (32, 8)",
            "L (34, 10)",
            "XL (36, 12)",
            "XXL (38, 14)",
          ];

  React.useEffect(() => {
    setCurrentSize(sizeOptions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const finalCurrentBrand =
    selectedCurrentBrand === "Other" ? currentBrandText : selectedCurrentBrand;
  const finalTargetBrand =
    selectedTargetBrand === "Other" ? targetBrandText : selectedTargetBrand;

  const calculateSize = async () => {
    if (!finalCurrentBrand || !currentSize || !finalTargetBrand) return;
    setCalculating(true);
    setResult(null);

    const body = {
      category,
      currentBrand: finalCurrentBrand,
      currentSize,
      targetBrand: finalTargetBrand,
    };

    try {
      const res = await fetch("/api/brand-size", {
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
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error calculating size.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What are you buying?
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 border"
            >
              <option value="T-Shirts & Tops">T-Shirts & Tops</option>
              <option value="Jeans & Trousers">Jeans & Trousers</option>
              <option value="Shoes">Shoes</option>
              <option value="Dresses">Dresses</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                Your Current Fit
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Which brand currently fits you?
                  </label>
                  <select
                    value={selectedCurrentBrand}
                    onChange={(e) => setSelectedCurrentBrand(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 mb-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {POPULAR_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  {selectedCurrentBrand === "Other" && (
                    <input
                      type="text"
                      value={currentBrandText}
                      onChange={(e) => setCurrentBrandText(e.target.value)}
                      placeholder="Type brand name"
                      className="w-full border border-slate-300 rounded-lg p-2.5 mt-2"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What size is it?
                  </label>
                  <select
                    value={currentSize}
                    onChange={(e) => setCurrentSize(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sizeOptions.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">
                New Purchase
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Which brand do you want to buy?
                  </label>
                  <select
                    value={selectedTargetBrand}
                    onChange={(e) => setSelectedTargetBrand(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 mb-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {POPULAR_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  {selectedTargetBrand === "Other" && (
                    <input
                      type="text"
                      value={targetBrandText}
                      onChange={(e) => setTargetBrandText(e.target.value)}
                      placeholder="Type new brand name"
                      className="w-full border border-slate-300 rounded-lg p-2.5 mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={calculateSize}
          disabled={
            (selectedCurrentBrand === "Other" && !currentBrandText) ||
            !currentSize ||
            (selectedTargetBrand === "Other" && !targetBrandText) ||
            calculating
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {calculating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {calculating ? "Comparing Brands..." : "Convert Size"}
        </button>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h3 className="text-lg font-bold text-slate-500 mb-2 border-b pb-4">
            Your Recommended Size for{" "}
            <span className="text-slate-800">{finalTargetBrand}</span>
          </h3>

          <div className="py-8">
            <span className="text-6xl font-black text-blue-600 tracking-tight">
              {result.recommendedSize}
            </span>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm max-w-md mx-auto">
            <p>{result.explanation}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Select Category & Current Fit
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Select whether you are buying a T-shirt, Pants, Shoes etc. Then
                type the brand you already wear and what size fits you
                perfectly.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Select Target Brand
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Type the name of the new brand you are looking to buy from.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Get Exact Size</h4>
              <p className="text-slate-600 text-sm mt-1">
                Our tool evaluates the sizing charts and standard fits for both
                brands to tell you exactly which size (S, M, L, XL or number)
                you should add to your cart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
