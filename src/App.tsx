/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SafeLinkScanner from './components/SafeLinkScanner';
import PdfToCsv from './components/PdfToCsv';
import ImageCompressor from './components/ImageCompressor';
import QrChecker from './components/QrChecker';
import FakeSocialChecker from './components/FakeSocialChecker';
import CommonDataFinder from './components/CommonDataFinder';
import PhotoMetadata from './components/PhotoMetadata';
import WhatsAppChecker from './components/WhatsAppChecker';
import PdfRedactor from './components/PdfRedactor';
import ChatToPdf from './components/ChatToPdf';
import GeoMapAnimator from './components/GeoMapAnimator';
import DocumentTranslator from './components/DocumentTranslator';
import TripCalculator from './components/TripCalculator';
import BrandSizeConverter from './components/BrandSizeConverter';
import YoutubeRecipe from './components/YoutubeRecipe';
import TowedVehicleFinder from './components/TowedVehicleFinder';
import DigitalFootprint from './components/DigitalFootprint';
import BankDecoder from './components/BankDecoder';
import { TOOLS } from './constants';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">{title}</h1>
      <p className="text-slate-500 max-w-lg mx-auto">This tool is currently under development. Please check back later.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/pdf-to-csv" replace />} />
          <Route path="/common-data-finder" element={<CommonDataFinder />} />
          <Route path="/chat-to-pdf" element={<ChatToPdf />} />
          <Route path="/geo-map-animator" element={<GeoMapAnimator />} />
          <Route path="/safe-link-scanner" element={<SafeLinkScanner />} />
          <Route path="/pdf-to-csv" element={<PdfToCsv />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/qr-checker" element={<QrChecker />} />
          <Route path="/fake-social-checker" element={<FakeSocialChecker />} />
          <Route path="/photo-metadata" element={<PhotoMetadata />} />
          <Route path="/whatsapp-checker" element={<WhatsAppChecker />} />
          <Route path="/pdf-redactor" element={<PdfRedactor />} />
          <Route path="/document-translator" element={<DocumentTranslator />} />
          <Route path="/trip-calculator" element={<TripCalculator />} />
          <Route path="/brand-size-converter" element={<BrandSizeConverter />} />
          <Route path="/youtube-recipe" element={<YoutubeRecipe />} />
          <Route path="/towed-vehicle-finder" element={<TowedVehicleFinder />} />
          <Route path="/digital-footprint" element={<DigitalFootprint />} />
          <Route path="/bank-decoder" element={<BankDecoder />} />
          
          {/* Other tool placeholders */}
          {TOOLS.filter(t => !['common-data-finder', 'chat-to-pdf', 'geo-map-animator', 'safe-link-scanner', 'pdf-to-csv', 'image-compressor', 'qr-checker', 'fake-social-checker', 'photo-metadata', 'whatsapp-checker', 'pdf-redactor', 'image-enhancer', 'document-translator', 'trip-calculator', 'brand-size-converter', 'youtube-recipe', 'towed-vehicle-finder', 'digital-footprint', 'bank-decoder'].includes(t.id)).map(tool => (
            // @ts-ignore
            <Route key={tool.id} path={tool.path} element={<Placeholder title={tool.name} />} />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

