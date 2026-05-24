import React, { useState, useRef } from 'react';
import { QrCode, UploadCloud, ShieldCheck, ShieldAlert, Loader2, Info } from 'lucide-react';
import jsQR from 'jsqr';
import { cn } from './Layout';

export default function QrChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [qrText, setQrText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setQrText(null);
    setResult(null);
    setError('');
    
    decodeQR(selected);
  };

  const decodeQR = (imageFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setQrText(code.data);
          analyzeWithAI(code.data);
        } else {
          setError("QR Code not found! Please upload a clear image.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  const analyzeWithAI = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/check-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrText: text })
      });
      if (!res.ok) throw new Error('Failed to analyze QR');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Safe QR Code Checker</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Upload a photo of a QR code to check which bank it belongs to, who will receive the money, and whether it is safe to scan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Upload QR Code</h3>
          
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl h-64 flex flex-col items-center justify-center p-8 transition-colors"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Click to Upload</h3>
              <p className="text-sm text-slate-500">JPG or PNG</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img src={preview} className="max-w-full max-h-full object-contain" alt="QR Preview" />
              </div>
              <button 
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setResult(null);
                  setQrText(null);
                  setError('');
                }}
                className="w-full py-2 bg-slate-100 font-medium text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Scan Another QR
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4">Scan Results</h3>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Decoding and AI analysis running...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center w-full">
                {error}
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 break-all">
                <p className="text-xs font-semibold text-blue-800 mb-1 uppercase">QR Data (Raw Content)</p>
                <p className="text-sm text-blue-900 font-mono">{qrText}</p>
              </div>

              <div className={cn(
                "rounded-xl p-5 border",
                result.isSafe ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {result.isSafe ? (
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                  )}
                  <h4 className={cn("font-bold text-lg", result.isSafe ? "text-green-800" : "text-red-800")}>
                    {result.isSafe ? "Appears to be safe" : "Warning: Invalid or potentially unsafe"}
                  </h4>
                </div>
                <p className="text-slate-700 text-sm">{result.explanation}</p>
              </div>

              {result.upiId && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  <div className="p-3 bg-slate-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">UPI ID</span>
                    <span className="font-mono text-slate-900">{result.upiId}</span>
                  </div>
                  {result.payeeName && (
                    <div className="p-3 bg-white flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Payee Name</span>
                      <span className="font-semibold text-slate-900">{result.payeeName}</span>
                    </div>
                  )}
                  {result.bankDetails && (
                    <div className="p-3 bg-slate-50 flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Bank Hint</span>
                      <span className="font-semibold text-slate-900">{result.bankDetails}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
               <Info className="w-10 h-10 mb-2 opacity-50" />
               <p>Please upload a QR code image to analyze.</p>
            </div>
          )}
        </div>
      </div>
      
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Take a photo of the QR code</h4>
              <p className="text-slate-600 text-sm mt-1">Take a clear photo or screenshot of the QR code you want to scan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Photo</h4>
              <p className="text-slate-600 text-sm mt-1">Click "Click to Upload" in the box above to provide the image.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Check Safety Result</h4>
              <p className="text-slate-600 text-sm mt-1">Our AI will read the code and tell you if it is safe, and if it's a UPI code, where the money will be sent to.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
