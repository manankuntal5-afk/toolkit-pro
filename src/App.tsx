/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import { TOOLS } from './constants';

const SafeLinkScanner = lazy(() => import('./components/SafeLinkScanner'));
const PdfToCsv = lazy(() => import('./components/PdfToCsv'));
const ImageCompressor = lazy(() => import('./components/ImageCompressor'));
const QrChecker = lazy(() => import('./components/QrChecker'));
const FakeSocialChecker = lazy(() => import('./components/FakeSocialChecker'));
const CommonDataFinder = lazy(() => import('./components/CommonDataFinder'));
const PhotoMetadata = lazy(() => import('./components/PhotoMetadata'));
const WhatsAppChecker = lazy(() => import('./components/WhatsAppChecker'));
const PdfRedactor = lazy(() => import('./components/PdfRedactor'));
const ChatToPdf = lazy(() => import('./components/ChatToPdf'));
const GeoMapAnimator = lazy(() => import('./components/GeoMapAnimator'));
const DocumentTranslator = lazy(() => import('./components/DocumentTranslator'));
const TripCalculator = lazy(() => import('./components/TripCalculator'));
const BrandSizeConverter = lazy(() => import('./components/BrandSizeConverter'));
const YoutubeRecipe = lazy(() => import('./components/YoutubeRecipe'));
const TowedVehicleFinder = lazy(() => import('./components/TowedVehicleFinder'));
const DigitalFootprint = lazy(() => import('./components/DigitalFootprint'));
const BankDecoder = lazy(() => import('./components/BankDecoder'));
const Blog = lazy(() => import('./components/Blog'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Privacy = lazy(() => import('./components/Privacy'));
const Terms = lazy(() => import('./components/Terms'));

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
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
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
                <Route key={tool.id} path={tool.path} element={<Placeholder title={tool.name} />} />
              ))}
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

