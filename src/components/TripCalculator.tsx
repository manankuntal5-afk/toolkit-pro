import React, { useState } from "react";
import { Fuel, Map, Play, Info } from "lucide-react";

export default function TripCalculator() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculateTrip = async () => {
    if (!source || !destination || !mileage) return;
    setCalculating(true);
    setResult(null);

    // Simulated calculation since we don't have a real toll API right now
    // In a real scenario, this would call a Maps API + Toll calculator API
    setTimeout(() => {
      const distance = Math.floor(Math.random() * 300) + 200; // Simulated distance 200-500km
      const fuelRates: Record<string, number> = {
        Petrol: 96,
        Diesel: 89,
        Electric: 15,
      };
      const rate = fuelRates[fuelType];
      const fuelNeeded = distance / parseFloat(mileage);
      const fuelCost = Math.round(fuelNeeded * rate);
      const tollCost = Math.round(distance * 1.5); // Approx 1.5 INR per km toll

      setResult({
        distance,
        fuelCost,
        tollCost,
        totalCost: fuelCost + tollCost,
        tolls: [
          { name: "Highway Plaza 1", amount: Math.round(tollCost * 0.4) },
          { name: "Expressway Toll", amount: Math.round(tollCost * 0.6) },
        ],
      });
      setCalculating(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vehicle Mileage (km/l or km/kWh)
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={calculateTrip}
          disabled={calculating || !source || !destination || !mileage}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {calculating ? (
            "Calculating budget..."
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Calculate Trip Budget
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6">
            Estimated Trip Budget
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 text-sm mb-1">Total Distance</p>
              <p className="text-2xl font-bold text-slate-800">
                {result.distance} km
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 text-sm mb-1">Fuel Cost</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{result.fuelCost}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 text-sm mb-1">Toll Tax</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{result.tollCost}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-blue-600 text-sm mb-1 font-medium">
                Total Budget
              </p>
              <p className="text-2xl font-bold text-blue-700">
                ₹{result.totalCost}
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2">
            Toll Plazas on Route
          </h4>
          <div className="space-y-3">
            {result.tolls.map((t: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 px-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700">{t.name}</span>
                </div>
                <span className="font-bold text-slate-800">₹{t.amount}</span>
              </div>
            ))}
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
                Enter Route & Vehicle Details
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Provide your starting point, destination, vehicle mileage, and
                select your fuel type (Petrol/Diesel/EV).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Calculate Budget</h4>
              <p className="text-slate-600 text-sm mt-1">
                Click Calculate. The tool will estimate distance, map the tolls
                on that route, and calculate total fuel prices.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">View Total Cost</h4>
              <p className="text-slate-600 text-sm mt-1">
                Get the exact combined estimated budget for fuel and toll taxes
                so you can plan your family trip properly without surprises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
