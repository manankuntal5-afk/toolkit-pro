import { FileSpreadsheet, MessageSquareText, Map, ShieldAlert, ImagePlus, QrCode, UserX, Image, Newspaper, FileType2, Camera, Eraser, Phone, Globe, Smartphone, Maximize } from "lucide-react";

export const TOOLS = [
  {
    id: "common-data-finder",
    name: "Common Data Finder",
    icon: FileSpreadsheet,
    path: "/common-data-finder",
    description: "Find common data in multiple CSV/Excel files."
  },
  {
    id: "chat-to-pdf",
    name: "Social Media Chat to PDF",
    icon: Smartphone,
    path: "/chat-to-pdf",
    description: "Convert Chat screenshots/TXT to PDF for court."
  },
  {
    id: "geo-map-animator",
    name: "Excel to 3D Map",
    icon: Globe,
    path: "/geo-map-animator",
    description: "Animate lat/long locations from Excel bulk data."
  },
  {
    id: "safe-link-scanner",
    name: "Safe Link Scanner",
    icon: ShieldAlert,
    path: "/safe-link-scanner",
    description: "Phishing and safe link checker with score."
  },
  {
    id: "qr-checker",
    name: "Safe QR Checker",
    icon: QrCode,
    path: "/qr-checker",
    description: "Check if QR code is safe and fetch UPI details."
  },
  {
    id: "fake-social-checker",
    name: "Fake Social Checker",
    icon: UserX,
    path: "/fake-social-checker",
    description: "Check fake social media accounts."
  },
  {
    id: "image-compressor",
    name: "Image Resizer",
    icon: Maximize,
    path: "/image-compressor",
    description: "Resize and compress images to fixed size (10kb-1MB)."
  },
  {
    id: "pdf-to-csv",
    name: "PDF to CSV & Chat",
    icon: FileType2,
    path: "/pdf-to-csv",
    description: "Convert PDF to CSV and Chat with AI."
  },
  {
    id: "photo-metadata",
    name: "Photo Metadata",
    icon: Camera,
    path: "/photo-metadata",
    description: "View photo Exif & metadata."
  },
  {
    id: "pdf-redactor",
    name: "PDF Redactor",
    icon: Eraser,
    path: "/pdf-redactor",
    description: "Hide or blur words in PDFs."
  },
  {
    id: "whatsapp-checker",
    name: "WhatsApp Checker",
    icon: Phone,
    path: "/whatsapp-checker",
    description: "Check if numbers use WhatsApp."
  }
];
