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
import Blog from './components/Blog';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
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
          <Route path="/" element={<Navigate to="/geo-map-animator" replace />} />
          <Route path="/common-data-finder" element={<CommonDataFinder />} />
          <Route path="/common-data-finder/:slug" element={<CommonDataFinder />} />
          <Route path="/chat-to-pdf" element={<ChatToPdf />} />
          <Route path="/chat-to-pdf/:slug" element={<ChatToPdf />} />
          <Route path="/geo-map-animator" element={<GeoMapAnimator />} />
          <Route path="/geo-map-animator/:slug" element={<GeoMapAnimator />} />
          <Route path="/safe-link-scanner" element={<SafeLinkScanner />} />
          <Route path="/safe-link-scanner/:slug" element={<SafeLinkScanner />} />
          <Route path="/pdf-to-csv" element={<PdfToCsv />} />
          <Route path="/pdf-to-csv/:slug" element={<PdfToCsv />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/image-compressor/:slug" element={<ImageCompressor />} />
          <Route path="/qr-checker" element={<QrChecker />} />
          <Route path="/qr-checker/:slug" element={<QrChecker />} />
          <Route path="/fake-social-checker" element={<FakeSocialChecker />} />
          <Route path="/fake-social-checker/:slug" element={<FakeSocialChecker />} />
          <Route path="/photo-metadata" element={<PhotoMetadata />} />
          <Route path="/photo-metadata/:slug" element={<PhotoMetadata />} />
          <Route path="/whatsapp-checker" element={<WhatsAppChecker />} />
          <Route path="/whatsapp-checker/:slug" element={<WhatsAppChecker />} />
          <Route path="/pdf-redactor" element={<PdfRedactor />} />
          <Route path="/pdf-redactor/:slug" element={<PdfRedactor />} />
          <Route path="/document-translator" element={<DocumentTranslator />} />
          <Route path="/document-translator/:slug" element={<DocumentTranslator />} />
          <Route path="/trip-calculator" element={<TripCalculator />} />
          <Route path="/trip-calculator/:slug" element={<TripCalculator />} />
          <Route path="/brand-size-converter" element={<BrandSizeConverter />} />
          <Route path="/brand-size-converter/:slug" element={<BrandSizeConverter />} />
          <Route path="/youtube-recipe" element={<YoutubeRecipe />} />
          <Route path="/youtube-recipe/:slug" element={<YoutubeRecipe />} />
          <Route path="/towed-vehicle-finder" element={<TowedVehicleFinder />} />
          <Route path="/towed-vehicle-finder/:slug" element={<TowedVehicleFinder />} />
          <Route path="/digital-footprint" element={<DigitalFootprint />} />
          <Route path="/digital-footprint/:slug" element={<DigitalFootprint />} />
          <Route path="/bank-decoder" element={<BankDecoder />} />
          <Route path="/bank-decoder/:slug" element={<BankDecoder />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          
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

