import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Info, MapPin, Map as MapIcon } from 'lucide-react';
import exifr from 'exifr';
import { cn } from './Layout';

export default function PhotoMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [basicInfo, setBasicInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
    setLoading(true);
    setMetadata(null);
    setBasicInfo(null);
    
    try {
      // Get basic image info (resolution)
      const img = new Image();
      const resolutionPromise = new Promise<{width: number, height: number}>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = objectUrl;
      });
      const resolution = await resolutionPromise;
      
      setBasicInfo({
        name: selected.name,
        size: (selected.size / 1024 / 1024).toFixed(2) + ' MB',
        type: selected.type,
        lastModified: new Date(selected.lastModified).toLocaleString(),
        resolution: `${resolution.width} x ${resolution.height}px`
      });

      // Parse basic EXIF, GPS
      const output = await exifr.parse(selected, { gps: true, exif: true, tiff: true });
      if (output && Object.keys(output).length > 0) {
        setMetadata(output);
      } else {
        setMetadata({});
      }
    } catch (err) {
      console.error(err);
      setMetadata({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Photo Details & Metadata Scanner</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Extract the hidden EXIF data and GPS coordinates from your original photos to see where and when they were taken.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-semibold text-slate-900 mb-4">Upload Photo</h3>
          
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl h-64 flex flex-col items-center justify-center p-8 transition-colors flex-1"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Select Photo</h3>
              <p className="text-sm text-slate-500">Only original photos contain metadata</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
                <img src={preview} className="max-w-full max-h-full object-contain" alt="Preview" />
              </div>
              <button 
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setMetadata(null);
                }}
                className="w-full py-2 bg-slate-100 font-medium text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Scan Another Photo
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px] overflow-hidden">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" /> Photo Data Results
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Scanning image data...</div>
            ) : !metadata ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-center text-sm">
                Upload a photo to view its details, time, and location information.
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {/* Basic File Info */}
                {basicInfo && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Basic File Information</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100">
                      <div className="p-3 bg-white flex justify-between items-center rounded-t-xl group">
                        <span className="text-sm font-medium text-slate-500">File Name</span>
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={basicInfo.name}>{basicInfo.name}</span>
                      </div>
                      <div className="p-3 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">File Type</span>
                        <span className="font-semibold text-slate-900">{basicInfo.type}</span>
                      </div>
                      <div className="p-3 bg-white flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">File Size</span>
                        <span className="font-semibold text-slate-900">{basicInfo.size}</span>
                      </div>
                      <div className="p-3 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Resolution</span>
                        <span className="font-semibold text-slate-900">{basicInfo.resolution}</span>
                      </div>
                      <div className="p-3 bg-white flex justify-between items-center rounded-b-xl">
                        <span className="text-sm font-medium text-slate-500">Last Modified</span>
                        <span className="font-mono text-xs text-slate-900">{basicInfo.lastModified}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* EXIF Data */}
                {Object.keys(metadata).length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-slate-500 text-center p-6 bg-slate-50 rounded-xl">
                     <p className="font-medium mb-2">No Hidden EXIF Data Found</p>
                     <p className="text-sm text-slate-400">Advanced EXIF metadata (camera model, GPS) has been stripped or was never present. This often happens if the photo was sent via WhatsApp, Facebook, or downloaded from the web.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hidden EXIF Data</h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100">
                        <div className="p-3 bg-white flex justify-between items-center rounded-t-xl group">
                          <span className="text-sm font-medium text-slate-500">Camera / Phone Make</span>
                          <span className="font-semibold text-slate-900">{metadata.Make || 'Unknown'}</span>
                        </div>
                        <div className="p-3 bg-slate-50 flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">Model</span>
                          <span className="font-semibold text-slate-900">{metadata.Model || 'Unknown'}</span>
                        </div>
                        <div className="p-3 bg-white flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">Original Date</span>
                          <span className="font-mono text-xs text-slate-900">
                            {metadata.DateTimeOriginal ? new Date(metadata.DateTimeOriginal).toLocaleString() : 'Not recorded'}
                          </span>
                        </div>
                        {metadata.LensModel && (
                        <div className="p-3 bg-slate-50 flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">Lens Model</span>
                          <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={metadata.LensModel}>{metadata.LensModel}</span>
                        </div>
                        )}
                        {metadata.FNumber && (
                        <div className="p-3 bg-white flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">Aperture (F-Number)</span>
                          <span className="font-mono text-xs text-slate-900">f/{metadata.FNumber}</span>
                        </div>
                        )}
                        {metadata.ExposureTime && (
                        <div className="p-3 bg-slate-50 flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">Exposure Time</span>
                          <span className="font-mono text-xs text-slate-900">1/{Math.round(1/metadata.ExposureTime)} sec</span>
                        </div>
                        )}
                        {metadata.ISO && (
                        <div className="p-3 bg-white flex justify-between items-center group">
                          <span className="text-sm font-medium text-slate-500">ISO</span>
                          <span className="font-mono text-xs text-slate-900">{metadata.ISO}</span>
                        </div>
                        )}
                        {metadata.FocalLength && (
                        <div className="p-3 bg-slate-50 flex justify-between items-center rounded-b-xl group">
                          <span className="text-sm font-medium text-slate-500">Focal Length</span>
                          <span className="font-mono text-xs text-slate-900">{metadata.FocalLength} mm</span>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* GPS Info */}
                    {metadata.latitude && metadata.longitude && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                          <MapPin className="w-5 h-5 text-blue-600" /> GPS Location Found!
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div>
                            <span className="text-xs text-blue-700 block">Latitude</span>
                            <span className="font-mono text-sm text-slate-900">{metadata.latitude}</span>
                          </div>
                          <div>
                            <span className="text-xs text-blue-700 block">Longitude</span>
                            <span className="font-mono text-sm text-slate-900">{metadata.longitude}</span>
                          </div>
                        </div>
                        <a 
                          href={`https://www.google.com/maps?q=${metadata.latitude},${metadata.longitude}`}
                          target="_blank" rel="noreferrer"
                          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 hover:bg-blue-700 w-full justify-center"
                        >
                          <MapIcon className="w-4 h-4" /> Open in Google Maps
                        </a>
                      </div>
                    )}

                    {/* Raw EXIF */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Raw EXIF JSON</h4>
                      <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl overflow-x-auto">
                        <pre>{JSON.stringify(metadata, null, 2)}</pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload Original Photo</h4>
              <p className="text-slate-600 text-sm mt-1">Click the Select Photo button and pick an original image file. Remember, images sent via WhatsApp or downloaded from the internet usually have their EXIF metadata removed to protect privacy.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-semibold text-slate-900">Read the Data</h4>
              <p className="text-slate-600 text-sm mt-1">The application reads the image properties entirely in your browser without uploading to a server, ensuring your data is kept secure.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-semibold text-slate-900">Check Location and Camera</h4>
              <p className="text-slate-600 text-sm mt-1">If available, it will display the date taken, the camera/phone model, and even provide a Google Maps link to the exact coordinates where the picture was snapped.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
