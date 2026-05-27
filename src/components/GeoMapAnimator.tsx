import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Map as MapIcon,
  UploadCloud,
  Play,
  Pause,
  Navigation,
  MapPin,
  Loader2,
  Calendar,
  Download,
  FileSpreadsheet,
  Globe,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "./Layout";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  CircleMarker,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const pulsingIcon = L.divIcon({
  className: "custom-pulsing-icon",
  html: `<div class="relative w-4 h-4">
           <div class="absolute inset-0 bg-red-500 rounded-full"></div>
           <div class="absolute inset-0 bg-red-500 rounded-full animate-ping" style="animation-duration: 2s"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function BoundsController({ locations }: { locations: LocationData[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], animate: false });
      }
    } else if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15, { animate: false });
    }
  }, [locations, map]);

  return null;
}

interface LocationData {
  lat: number;
  lng: number;
  datetime?: string;
  _parsedDate?: number;
  index: number;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function getVehicleType(
  prev: LocationData | undefined | null,
  curr: LocationData | undefined | null,
) {
  if (!prev || !curr) return "car";
  const distKm = getDistance(prev.lat, prev.lng, curr.lat, curr.lng);

  let speed = 0;
  if (prev._parsedDate && curr._parsedDate) {
    const timeHr = (curr._parsedDate - prev._parsedDate) / (1000 * 60 * 60);
    if (timeHr > 0) {
      speed = distKm / timeHr;
    }
  }

  if (distKm > 500 || speed > 350) return "airplane";
  if (distKm > 50 || speed > 100) return "train";
  if (distKm > 5 || speed > 20) return "car";
  if (distKm > 0.5 || speed > 5) return "bike";
  return "walk";
}

function getVehicleColor(type: string) {
  return "#2563eb"; // blue-600
}

export default function GeoMapAnimator() {
  const [file, setFile] = useState<File | null>(null);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: number | null;
    end: number | null;
  }>({ start: null, end: null });
  const [fileDateBounds, setFileDateBounds] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [totalParsedLocations, setTotalParsedLocations] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [animating, setAnimating] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullPath, setShowFullPath] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [addressCache, setAddressCache] = useState<Record<string, string>>({});
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [interpolatedPos, setInterpolatedPos] = useState<
    [number, number] | null
  >(null);
  const pendingLookups = useRef(new Set<string>());

  const lookupAddress = useCallback(
    async (lat: number, lng: number) => {
      const key = `${lat},${lng}`;
      if (addressCache[key]) return addressCache[key];
      if (pendingLookups.current.has(key)) return;

      pendingLookups.current.add(key);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await res.json();
        const address =
          data && data.display_name ? data.display_name : "Address not found";
        setAddressCache((prev) => ({ ...prev, [key]: address }));
        pendingLookups.current.delete(key);
        return address;
      } catch (e) {
        pendingLookups.current.delete(key);
        return "Error loading address";
      }
    },
    [addressCache],
  );

  const availableDates = useMemo(() => {
    const dates: { index: number; label: string }[] = [];

    // We iterate in the exact order of the file, adding EVERY valid datetime
    allLocations.forEach((loc) => {
      if (loc.datetime && loc.datetime !== "-") {
        dates.push({ index: loc.index, label: loc.datetime });
      }
    });

    return dates;
  }, [allLocations]);

  const locations = useMemo(() => {
    if (dateRange.start === null || dateRange.end === null) return allLocations;
    return allLocations.filter((loc) => {
      if (!loc.datetime || loc.datetime === "-") return true; // keep locations without dates if any
      return loc.index >= dateRange.start! && loc.index <= dateRange.end!;
    });
  }, [allLocations, dateRange]);

  const activeVehicleType = useMemo(() => {
    if (
      currentIndex <= 0 ||
      !locations[currentIndex] ||
      !locations[currentIndex - 1]
    )
      return "car";
    return getVehicleType(locations[currentIndex - 1], locations[currentIndex]);
  }, [currentIndex, locations]);

  const airplaneIcon = useMemo(
    () =>
      new L.DivIcon({
        html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 2px solid #1e293b;">✈️</div>`,
        className: "custom-vehicle-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );
  const trainIcon = useMemo(
    () =>
      new L.DivIcon({
        html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 2px solid #1e293b;">🚆</div>`,
        className: "custom-vehicle-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );
  const carIcon = useMemo(
    () =>
      new L.DivIcon({
        html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 2px solid #1e293b;">🚗</div>`,
        className: "custom-vehicle-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );
  const bikeIcon = useMemo(
    () =>
      new L.DivIcon({
        html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 2px solid #1e293b;">🏍️</div>`,
        className: "custom-vehicle-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );
  const walkIcon = useMemo(
    () =>
      new L.DivIcon({
        html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 2px solid #1e293b;">🚶</div>`,
        className: "custom-vehicle-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  );
  const activeIcon =
    activeVehicleType === "airplane"
      ? airplaneIcon
      : activeVehicleType === "train"
        ? trainIcon
        : activeVehicleType === "car"
          ? carIcon
          : activeVehicleType === "bike"
            ? bikeIcon
            : walkIcon;

  useEffect(() => {
    if (
      animating &&
      currentIndex > 0 &&
      locations[currentIndex] &&
      locations[currentIndex - 1]
    ) {
      const prev = locations[currentIndex - 1];
      const curr = locations[currentIndex];
      const distKm = getDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      let zoom = 16;
      if (distKm > 100) zoom = 6;
      else if (distKm > 50) zoom = 8;
      else if (distKm > 20) zoom = 10;
      else if (distKm > 10) zoom = 11;
      else if (distKm > 5) zoom = 13;
      else if (distKm > 2) zoom = 14;
      else if (distKm > 1) zoom = 15;
      else zoom = 16;

      setMapZoom(zoom);
    }
  }, [currentIndex, animating, locations]);

  useEffect(() => {
    if (
      !animating ||
      currentIndex <= 0 ||
      !locations[currentIndex] ||
      !locations[currentIndex - 1]
    ) {
      setInterpolatedPos(null);
      return;
    }
    const prev = locations[currentIndex - 1];
    const curr = locations[currentIndex];

    let start = performance.now();

    let duration = playbackSpeed;
    if (prev && curr) {
      const distKm = getDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      if (distKm < 0.00001) {
        duration = 1; // Instant!
      }
    }

    let frameId: number;

    const animate = (time: number) => {
      let progress = (time - start) / duration;
      if (progress > 1) progress = 1;

      const lat = prev.lat + (curr.lat - prev.lat) * progress;
      const lng = prev.lng + (curr.lng - prev.lng) * progress;
      setInterpolatedPos([lat, lng]);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setInterpolatedPos([curr.lat, curr.lng]);

        let nextIdx = currentIndex + 1;
        while (nextIdx < locations.length) {
          if (
            getDistance(
              curr.lat,
              curr.lng,
              locations[nextIdx].lat,
              locations[nextIdx].lng,
            ) > 0.00001
          ) {
            break;
          }
          nextIdx++;
        }

        if (nextIdx < locations.length) {
          setCurrentIndex(nextIdx);
        } else {
          setCurrentIndex(locations.length - 1);
          setAnimating(false);
        }
      }
    };
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [currentIndex, animating, playbackSpeed, locations]);

  const visibleLocations = useMemo(() => {
    if (showFullPath) {
      return locations;
    }
    if (currentIndex === -1) {
      return [];
    }
    return locations.slice(0, currentIndex + 1);
  }, [locations, currentIndex, showFullPath]);

  const polylinePath = useMemo(() => {
    if (locations.length === 0 || currentIndex < 0) return [];
    if (showFullPath)
      return locations.map((l) => [l.lat, l.lng] as [number, number]);

    const path: [number, number][] = [];

    for (let i = 0; i < currentIndex; i++) {
      path.push([locations[i].lat, locations[i].lng]);
    }

    if (animating && interpolatedPos) {
      path.push(interpolatedPos);
    } else if (locations[currentIndex]) {
      path.push([locations[currentIndex].lat, locations[currentIndex].lng]);
    }

    return path;
  }, [locations, currentIndex, showFullPath, animating, interpolatedPos]);

  const upcomingLocations = useMemo(() => {
    if (locations.length === 0) return [];
    const startIdx = Math.max(0, currentIndex);
    return locations.slice(startIdx, startIdx + 30); // show next 30 points
  }, [locations, currentIndex]);

  // Reverse Geocoding (Address Lookup)
  useEffect(() => {
    if (locations.length === 0) {
      setCurrentAddress("");
      return;
    }
    const cur = locations[currentIndex];
    if (!cur) return;

    const key = `${cur.lat},${cur.lng}`;
    if (addressCache[key]) {
      setCurrentAddress(addressCache[key]);
      return;
    }

    setCurrentAddress("Finding address...");

    const timer = setTimeout(async () => {
      const addr = await lookupAddress(cur.lat, cur.lng);
      if (addr) setCurrentAddress(addr);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex, locations, addressCache, lookupAddress]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setLoading(true);
    setLoadingText("");
    setTotalParsedLocations(0);
    setAllLocations([]);
    setDateRange({ start: null, end: null });
    setFileDateBounds(null);
    setCurrentIndex(-1);
    setAnimating(false);
    setHasStartedPlaying(false);
    setShowFullPath(true);

    try {
      let parsedData: any[][] = [];
      let rawText = "";

      if (selected.name.endsWith(".csv") || selected.name.endsWith(".txt")) {
        rawText = await selected.text();
        const res = Papa.parse(rawText, {
          header: false,
          skipEmptyLines: true,
        });
        parsedData = res.data as any[][];
      } else {
        const buffer = await selected.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        }) as any[][];
        rawText = XLSX.utils.sheet_to_csv(worksheet);
      }

      setTimeout(async () => {
        if (parsedData.length === 0) {
          setLoading(false);
          setLoadingText("");
          alert("File is empty or couldn't be parsed.");
          return;
        }

        let headerRowIdx = -1;
        let latIdx = -1,
          lngIdx = -1,
          combinedCgiIdx = -1,
          dateIdx = -1,
          timeIdx = -1,
          locIdx = -1;

        let maxScore = 0;
        for (let r = 0; r < Math.min(parsedData.length, 50); r++) {
          const row = parsedData[r];
          if (!row || !Array.isArray(row)) continue;

          let score = 0;
          let tLat = -1,
            tLng = -1,
            tCgi = -1,
            tDate = -1,
            tTime = -1,
            tLoc = -1;

          for (let c = 0; c < row.length; c++) {
            const val = String(row[c]).toLowerCase().trim();
            if (!val) continue;

            const isLocationWord =
              val.includes("location") ||
              val.includes("address") ||
              val.includes("place") ||
              val.includes("पता") ||
              val.includes("स्थान") ||
              val.includes("site") ||
              val.includes("area") ||
              val.includes("city") ||
              val.includes("vill") ||
              val.includes("gao") ||
              val.includes("gaon") ||
              val.includes("tower") ||
              val.includes("add") ||
              val.includes("addres");

            if (
              !val.includes("last") &&
              (val.includes("lat") || val === "lt") &&
              tLat === -1
            ) {
              tLat = c;
              score += 10;
            } else if (
              !val.includes("last") &&
              (val.includes("lon") || val.includes("lng") || val === "lg") &&
              tLng === -1
            ) {
              tLng = c;
              score += 10;
            } else if (!val.includes("last") && isLocationWord && tLoc === -1) {
              tLoc = c;
              score += 10;
            } else if (
              !val.includes("last") &&
              (val.includes("cgi") || val.includes("first")) &&
              tCgi === -1
            ) {
              tCgi = c;
              score += 5;
            } else if (
              !val.includes("last") &&
              (val.includes("date") ||
                val.includes("dina") ||
                val.includes("dinank") ||
                val.includes("दिनांक")) &&
              tDate === -1
            ) {
              tDate = c;
              score += 2;
            } else if (
              !val.includes("last") &&
              !val.includes("update") &&
              (val.includes("time") ||
                val.includes("samay") ||
                val.includes("smay") ||
                val.includes("समय")) &&
              tTime === -1
            ) {
              tTime = c;
              score += 2;
            }
          }

          if (score > maxScore && score > 0) {
            maxScore = score;
            headerRowIdx = r;
            latIdx = tLat;
            lngIdx = tLng;
            combinedCgiIdx = tCgi;
            dateIdx = tDate;
            timeIdx = tTime;
            locIdx = tLoc;
          }
        }

        // If we found NO location/lat/lng column, try to guess the address column
        if (
          latIdx === -1 &&
          lngIdx === -1 &&
          combinedCgiIdx === -1 &&
          locIdx === -1
        ) {
          let bestTextCol = -1;
          const colsCount = (parsedData[0] && parsedData[0].length) || 0;
          for (let c = 0; c < colsCount; c++) {
            let textScore = 0;
            for (
              let r = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
              r < Math.min(parsedData.length, 20);
              r++
            ) {
              const row = parsedData[r];
              if (!row || !Array.isArray(row)) continue;
              const val = String(row[c] || "").trim();
              if (
                val.length > 5 &&
                isNaN(Number(val)) &&
                !val.match(/^(\d{1,4})[\.\-\/](\d{1,2})/) &&
                !val.match(/^\d{1,2}:\d{1,2}/)
              ) {
                textScore++;
              }
            }
            if (textScore >= 3) {
              bestTextCol = c;
              break; // Strictly take the first column that resembles text
            } else if (textScore > 0 && bestTextCol === -1) {
              bestTextCol = c; // Fallback to first column with any text
            }
          }
          if (bestTextCol !== -1) {
            locIdx = bestTextCol;
          }
        }

        const parseDateTimeStr = (dStr: string, tStr: string) => {
          if (!dStr) return null;
          let dateP = "";
          let d = "",
            m = "",
            y = "";

          // DD/MM/YY or DD/MM/YYYY
          const dmvMatch = dStr.match(
            /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})/,
          );
          if (dmvMatch) {
            d = dmvMatch[1];
            m = dmvMatch[2];
            y = dmvMatch[3];
            if (y.length === 2) y = "20" + y;
          } else {
            const ymdMatch = dStr.match(
              /^(\d{4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})/,
            );
            if (ymdMatch) {
              y = ymdMatch[1];
              m = ymdMatch[2];
              d = ymdMatch[3];
            }
          }
          if (d && m && y) {
            dateP = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          }

          let hr = 0,
            min = 0,
            sec = 0;
          let tMatch = (tStr || "").match(/(\d{1,2}):?(\d{1,2})?:?(\d{1,2})?/);
          if (tMatch && tMatch[1]) {
            hr = parseInt(tMatch[1], 10);
            if (tMatch[2]) min = parseInt(tMatch[2], 10);
            if (tMatch[3]) sec = parseInt(tMatch[3], 10);

            if (/pm/i.test(tStr) && hr < 12) hr += 12;
            if (/am/i.test(tStr) && hr === 12) hr = 0;
          }

          let tP = `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

          if (!dateP) {
            const fallbackP = new Date(`${dStr} ${tStr}`.trim()).getTime();
            return !isNaN(fallbackP) ? fallbackP : null;
          }

          let finalStr = `${dateP}T${tP}`;
          const p = new Date(finalStr).getTime();
          return !isNaN(p) ? p : null;
        };

        const rawExtracted: {
          lat: number | null;
          lng: number | null;
          datetime: string;
          _parsedDate: number | undefined;
          addressString: string | null;
        }[] = [];
        const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

        for (let r = startRow; r < parsedData.length; r++) {
          const row = parsedData[r];
          if (!row || !Array.isArray(row)) continue;

          let lat: number | null = null;
          let lng: number | null = null;
          let addressStr: string | null = null;

          // 1. Try named headers
          if (latIdx !== -1 && lngIdx !== -1) {
            lat = parseFloat(row[latIdx]);
            lng = parseFloat(row[lngIdx]);
          } else if (combinedCgiIdx !== -1) {
            const val = String(row[combinedCgiIdx]);
            const match = val.match(
              /(-?\d{1,3}\.\d{2,})[\s,;|:\/]+(-?\d{1,3}\.\d{2,})/,
            );
            if (match) {
              lat = parseFloat(match[1]);
              lng = parseFloat(match[2]);
            }
          }

          // 2. Fallback: sniff cell by cell for coords
          if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
            for (let c = 0; c < row.length; c++) {
              const val = String(row[c]).trim();
              const match = val.match(
                /(-?\d{1,3}\.\d{2,})[\s,;|:\/]+(-?\d{1,3}\.\d{2,})/,
              );
              if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
                break;
              }
            }
          }

          if (
            (lat === null || lng === null || isNaN(lat) || isNaN(lng)) &&
            locIdx !== -1
          ) {
            addressStr = String(row[locIdx] || "").trim();
          }

          let dStr = dateIdx !== -1 ? String(row[dateIdx] || "").trim() : "";
          let tStr = timeIdx !== -1 ? String(row[timeIdx] || "").trim() : "";

          // Fallback for datetime if not found via header:
          if (!dStr) {
            for (let c = 0; c < row.length; c++) {
              const val = String(row[c]).trim();
              if (val.match(/^(\d{1,4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,4})/)) {
                if (!dStr) dStr = val;
              }
            }
          }
          if (!tStr) {
            for (let c = 0; c < row.length; c++) {
              const val = String(row[c]).trim();
              if (val.match(/^\d{1,2}:\d{1,2}(:\d{1,2})?(\s?[aApP][mM])?/)) {
                if (!tStr && val !== dStr) tStr = val;
              }
            }
          }

          // Sometime date string contains time too "19-05-2026 12:45"
          // If dStr has time but tStr is empty
          if (dStr && !tStr) {
            const timeMatch = dStr.match(/\d{1,2}:\d{1,2}(:\d{1,2})?/);
            if (timeMatch) {
              tStr = timeMatch[0];
              dStr = dStr.replace(timeMatch[0], "").trim();
            }
          }

          let datetime = `${dStr} ${tStr}`.trim();
          let parsedDate = parseDateTimeStr(dStr, tStr);

          if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
              const t = lat;
              lat = lng;
              lng = t;
            }
            if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
              rawExtracted.push({
                lat,
                lng,
                datetime: datetime || "-",
                _parsedDate: parsedDate || undefined,
                addressString: null,
              });
            }
          } else if (addressStr && addressStr.length > 3) {
            rawExtracted.push({
              lat: null,
              lng: null,
              datetime: datetime || "-",
              _parsedDate: parsedDate || undefined,
              addressString: addressStr,
            });
          }
        }

        const updateMapLocations = (currentRaw: any[]) => {
          const extracted: LocationData[] = [];
          for (const item of currentRaw) {
            if (item.lat !== null && item.lng !== null) {
              extracted.push({
                lat: item.lat,
                lng: item.lng,
                datetime: item.datetime,
                _parsedDate: item._parsedDate,
                index: extracted.length,
              });
            }
          }

          const deduplicated: LocationData[] = [];
          extracted.forEach((loc) => {
            if (deduplicated.length === 0) {
              deduplicated.push(loc);
            } else {
              const prev = deduplicated[deduplicated.length - 1];
              if (prev.lat !== loc.lat || prev.lng !== loc.lng) {
                deduplicated.push(loc);
              }
            }
          });

          deduplicated.forEach((e, i) => (e.index = i));

          if (deduplicated.length > 0) {
            setAllLocations(deduplicated);
            const validLocations = deduplicated.filter(
              (l) => l.datetime && l.datetime !== "-",
            );
            if (validLocations.length > 0) {
              const minIdx = validLocations[0].index;
              const maxIdx = validLocations[validLocations.length - 1].index;

              setFileDateBounds({ min: minIdx, max: maxIdx });
              setDateRange((prev) => {
                // Only set initially if not set
                if (prev.start === null) {
                  return { start: minIdx, end: maxIdx };
                }
                return prev;
              });
            }
            setCurrentIndex((prev) => {
              return deduplicated.length - 1;
            });
          }
        };

        // Update map immediately for those with lat/long already available
        setTotalParsedLocations(rawExtracted.length);
        updateMapLocations(rawExtracted);

        let geocodeCount = rawExtracted.filter((x) => x.lat === null).length;
        if (geocodeCount > 0) {
          let currentGeocode = 0;
          const geocodeCache: Record<
            string,
            { lat: number; lon: number } | null
          > = {};
          for (let i = 0; i < rawExtracted.length; i++) {
            const item = rawExtracted[i];
            if (item.lat === null && item.addressString) {
              currentGeocode++;
              if (geocodeCache[item.addressString] !== undefined) {
                const cached = geocodeCache[item.addressString];
                if (cached) {
                  rawExtracted[i].lat = cached.lat;
                  rawExtracted[i].lng = cached.lon;
                  updateMapLocations([...rawExtracted]);
                }
                continue;
              }

              setLoadingText(
                `Geocoding ${currentGeocode} of ${geocodeCount}...\n*Rate limited to 1 address per second for free services*`,
              );
              try {
                let q = item.addressString;
                let res = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&email=test@example.com`,
                );
                let data = await res.json();

                if (
                  (!data || data.length === 0) &&
                  !q.toLowerCase().includes("india")
                ) {
                  await new Promise((r) => setTimeout(r, 1100)); // wait before fallback
                  res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", India")}&limit=1&email=test@example.com`,
                  );
                  data = await res.json();
                }

                if (data && data.length > 0) {
                  const lat = parseFloat(data[0].lat);
                  const lon = parseFloat(data[0].lon);
                  rawExtracted[i].lat = lat;
                  rawExtracted[i].lng = lon;
                  geocodeCache[item.addressString] = { lat, lon };
                  updateMapLocations([...rawExtracted]);
                } else {
                  geocodeCache[item.addressString] = null;
                }
              } catch (e) {
                console.error("Geocoding failed for: ", item.addressString);
                geocodeCache[item.addressString] = null;
              }
              await new Promise((r) => setTimeout(r, 1100)); // Respect OpenStreetMap limit (1s per req)
            }
          }
        }

        setLoading(false);
        setLoadingText("");
        if (rawExtracted.filter((x) => x.lat !== null).length === 0) {
          alert(
            "Could not find valid Latitude/Longitude or Address points in this file.",
          );
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleAnimation = () => {
    setHasStartedPlaying(true);
    if (!animating) {
      if (currentIndex >= locations.length - 1 || currentIndex < 0) {
        setCurrentIndex(locations.length > 1 ? 1 : 0);
        if (locations.length > 0) {
          setInterpolatedPos([locations[0].lat, locations[0].lng]);
        }
      } else {
        if (currentIndex > 0) {
          setInterpolatedPos([
            locations[currentIndex - 1].lat,
            locations[currentIndex - 1].lng,
          ]);
        }
      }
      setAnimating(true);
      setShowFullPath(false);
    } else {
      setAnimating(false);
    }
  };

  const generatePDF = async () => {
    if (visibleLocations.length === 0) return;
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      let currentY = 15;

      doc.setFontSize(18);
      doc.text("Location Tracking Report", 14, currentY);
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      if (dateRange.start !== null && dateRange.end !== null) {
        const sLabel =
          availableDates.find((d) => d.index === dateRange.start)?.label ||
          "Start";
        const eLabel =
          availableDates.find((d) => d.index === dateRange.end)?.label || "End";
        doc.text(
          `Filtered by Date Range: ${sLabel} to ${eLabel}`,
          14,
          currentY,
        );
      } else {
        doc.text("All locations", 14, currentY);
      }
      currentY += 10;

      const mapElement = document.getElementById("map-container-for-pdf");
      if (mapElement) {
        try {
          await new Promise((r) => setTimeout(r, 500));
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = doc.internal.pageSize.getWidth() - 28;
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          const finalHeight = Math.min(pdfHeight, 140);
          const finalWidth = (canvas.width * finalHeight) / canvas.height;

          const xOffset = 14 + (pdfWidth - finalWidth) / 2;
          doc.addImage(
            imgData,
            "PNG",
            xOffset,
            currentY,
            finalWidth,
            finalHeight,
          );
          currentY += finalHeight + 15;
        } catch (e) {
          console.warn(
            "Could not capture map image due to CORS. Continuing without map image.",
          );
        }
      }

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Detailed Location Log:", 14, currentY);
      currentY += 5;

      const tableData = visibleLocations.map((l, i) => {
        const key = `${l.lat},${l.lng}`;
        return [
          i + 1,
          l.datetime || "-",
          `${l.lat.toFixed(6)}, ${l.lng.toFixed(6)}`,
          addressCache[key] || "-",
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Date & Time", "Coordinates", "Address"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
      });

      doc.save("Location_Report.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const generateExcel = () => {
    if (visibleLocations.length === 0) return;
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        visibleLocations.map((l, i) => {
          const key = `${l.lat},${l.lng}`;
          return {
            "S.No": i + 1,
            "Date & Time": l.datetime || "-",
            Latitude: l.lat,
            Longitude: l.lng,
            Address: addressCache[key] || "-",
          };
        }),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
      XLSX.writeFile(workbook, "Location_Report.xlsx");
    } catch (err) {
      console.error("Failed to generate Excel:", err);
      alert("Failed to generate Excel file.");
    }
  };

  // Center the map around the current target point (Leaflet will smoothly fly to it)
  const mapCenter: [number, number] =
    locations.length > 0 && currentIndex >= 0 && locations[currentIndex]
      ? [locations[currentIndex].lat, locations[currentIndex].lng]
      : locations.length > 0 && locations[0]
        ? [locations[0].lat, locations[0].lng]
        : [20.5937, 78.9629];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
      {/* Huge Keyword Banner for Home Page */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Excel to 3D Map Bulk Tracker
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">
          Instantly convert your spreadsheet data into beautiful, animated
          geolocation maps.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-6 md:p-8 mb-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 mb-8 relative z-10">
          <div className="flex-1 w-full relative group">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv, .xlsx, .xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className={cn(
                "bg-[#2563eb] rounded-2xl w-full relative flex flex-col items-center justify-center p-12 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-[#1d4ed8] transition-all duration-300 overflow-hidden group border-4 border-transparent hover:border-white h-[280px]",
                file && "bg-[#1d4ed8]",
              )}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
              <UploadCloud className="w-16 h-16 text-white mb-6 drop-shadow-md group-hover:-translate-y-2 transition-transform duration-300" />
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight text-center relative z-10">
                {file ? file.name : "Upload CSV/Excel Spreadsheet Here"}
              </h3>
              <p className="text-[#a4e1df] font-medium text-center relative z-10 text-[16px]">
                {file
                  ? "File Loaded Successfully. Click to Change."
                  : "Drag & Drop or Click to Browse"}
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 flex flex-col justify-center min-h-[140px] text-center shadow-sm">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Locations Found
              </h4>
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">
                  {loading ? totalParsedLocations : locations.length}
                </span>
                {loading && loadingText && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="text-xs font-medium whitespace-pre-line text-left leading-tight">
                      {loadingText}
                    </span>
                  </div>
                )}
                {loading && !loadingText && (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mt-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        {file !== null && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative flex flex-col">
              <div className="px-4 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAnimation}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-colors shadow flex-shrink-0 h-[68px]",
                      animating
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    {animating ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" /> Play
                      </>
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Point {Math.max(0, currentIndex + 1)} of{" "}
                      {loading ? totalParsedLocations : locations.length}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {currentIndex >= 0 && locations[currentIndex]
                        ? `${locations[currentIndex].lat.toFixed(6)}, ${locations[currentIndex].lng.toFixed(6)}`
                        : "Ready to play"}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[70px]">
                        Delay: {(playbackSpeed / 1000).toFixed(1)}s
                      </span>
                      <input
                        title="Animation Delay"
                        type="range"
                        min={500}
                        max={5000}
                        step={100}
                        value={playbackSpeed}
                        onChange={(e) =>
                          setPlaybackSpeed(Number(e.target.value))
                        }
                        className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    {currentIndex >= 0 &&
                      locations[currentIndex] &&
                      locations[currentIndex].datetime !== "-" && (
                        <span className="text-xs font-medium text-slate-600 mt-0.5 whitespace-normal max-w-sm">
                          {locations[currentIndex].datetime}
                        </span>
                      )}
                    {currentIndex >= 0 &&
                      locations[currentIndex] &&
                      currentAddress && (
                        <span className="text-xs font-medium text-blue-600 mt-0.5 whitespace-normal max-w-sm">
                          <MapPin className="w-3 h-3 inline-block -mt-0.5 mr-1" />
                          {currentAddress}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Zoom: {mapZoom}
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="22"
                      value={mapZoom}
                      onChange={(e) => setMapZoom(Number(e.target.value))}
                      className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateExcel}
                      disabled={visibleLocations.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel Report
                    </button>
                    <button
                      onClick={generatePDF}
                      disabled={generatingPdf || visibleLocations.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      PDF Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Date / Time Selector Dropdown */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    Filter by Date & Time Range:
                  </span>
                </div>

                {fileDateBounds ? (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-500 font-medium mb-1">
                        Start Date/Time
                      </label>
                      <select
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                        value={dateRange.start !== null ? dateRange.start : ""}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setDateRange((prev) => ({
                            ...prev,
                            start: isNaN(idx) ? fileDateBounds.min : idx,
                          }));
                          setCurrentIndex(-1);
                          setAnimating(false);
                          setShowFullPath(false);
                          setHasStartedPlaying(false);
                        }}
                      >
                        {availableDates.map((d) => (
                          <option key={`start-${d.index}`} value={d.index}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-slate-500 font-medium mb-1">
                        End Date/Time
                      </label>
                      <select
                        className="bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                        value={dateRange.end !== null ? dateRange.end : ""}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setDateRange((prev) => ({
                            ...prev,
                            end: isNaN(idx) ? fileDateBounds.max : idx,
                          }));
                          setCurrentIndex(-1);
                          setAnimating(false);
                          setShowFullPath(false);
                          setHasStartedPlaying(false);
                        }}
                      >
                        {availableDates.map((d) => (
                          <option key={`end-${d.index}`} value={d.index}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    No date/time found in the file to filter.
                  </div>
                )}
              </div>

              <div
                id="map-container-for-pdf"
                className="h-[600px] w-full relative bg-[#e5e3df] z-0 overflow-hidden"
              >
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        crossOrigin="anonymous"
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite">
                      <TileLayer
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        crossOrigin="anonymous"
                      />
                    </LayersControl.BaseLayer>

                    {/* Map Overlays */}
                    <LayersControl.Overlay name="Transit Lines">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                        crossOrigin="anonymous"
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Bike Paths">
                      <TileLayer
                        attribution='&copy; <a href="https://cycling.waymarkedtrails.org/">Waymarked Trails</a>'
                        url="https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png"
                        crossOrigin="anonymous"
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Location Density (Heatmap)">
                      <LayerGroup>
                        {visibleLocations.map((l, i) => (
                          <CircleMarker
                            key={`heat-${i}`}
                            center={[l.lat, l.lng]}
                            radius={25}
                            pathOptions={{
                              color: "transparent",
                              fillColor: "#22c55e",
                              fillOpacity: 0.15,
                            }}
                          />
                        ))}
                      </LayerGroup>
                    </LayersControl.Overlay>
                  </LayersControl>

                  <BoundsController locations={locations} />

                  {/* The Path */}
                  <Polyline
                    positions={polylinePath}
                    color="#22c55e"
                    weight={5}
                    opacity={0.8}
                  />

                  {/* All minor markers */}
                  {visibleLocations.map((l, i) => {
                    const key = `${l.lat},${l.lng}`;
                    const addr = addressCache[key] || "Finding address...";
                    return (
                      <CircleMarker
                        key={i}
                        center={[l.lat, l.lng]}
                        radius={6}
                        pathOptions={{
                          color: "#ffffff",
                          fillColor: "#22c55e",
                          fillOpacity: 1,
                          weight: 2,
                        }}
                        eventHandlers={{
                          mouseover: () => {
                            if (
                              !addressCache[key] &&
                              !pendingLookups.current.has(key)
                            ) {
                              lookupAddress(l.lat, l.lng);
                            }
                          },
                          click: () => {
                            setCurrentIndex(i);
                            setAnimating(false);
                            setShowFullPath(true);
                            if (
                              !addressCache[key] &&
                              !pendingLookups.current.has(key)
                            ) {
                              lookupAddress(l.lat, l.lng);
                            }
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                          <div className="flex flex-col max-w-[200px] whitespace-normal">
                            {l.datetime && l.datetime !== "-" && (
                              <span className="font-semibold text-sm mb-1">
                                {l.datetime}
                              </span>
                            )}
                            <span className="text-xs text-slate-600 mb-1 font-mono">
                              {l.lat.toFixed(6)}, {l.lng.toFixed(6)}
                            </span>
                            <span className="text-xs font-medium text-slate-800 leading-tight">
                              {addr}
                            </span>
                          </div>
                        </Tooltip>
                        <Popup offset={[0, -5]}>
                          <div className="flex flex-col max-w-[200px] whitespace-normal">
                            {l.datetime && l.datetime !== "-" && (
                              <span className="font-semibold text-sm mb-1">
                                {l.datetime}
                              </span>
                            )}
                            <span className="text-xs text-slate-600 mb-1 font-mono">
                              {l.lat.toFixed(6)}, {l.lng.toFixed(6)}
                            </span>
                            <span className="text-xs font-medium text-slate-800 leading-tight">
                              {addr}
                            </span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* The MAIN animated marker */}
                  {hasStartedPlaying &&
                    currentIndex >= 0 &&
                    locations.length > 0 &&
                    locations[currentIndex] && (
                      <Marker
                        position={
                          interpolatedPos && animating
                            ? interpolatedPos
                            : mapCenter
                        }
                        icon={activeIcon}
                        zIndexOffset={100}
                      >
                        <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                          <div className="flex flex-col max-w-[200px] whitespace-normal">
                            {locations[currentIndex].datetime &&
                              locations[currentIndex].datetime !== "-" && (
                                <span className="font-semibold text-sm mb-1">
                                  {locations[currentIndex].datetime}
                                </span>
                              )}
                            <span className="text-xs text-slate-600 mb-1 font-mono">
                              {locations[currentIndex].lat.toFixed(6)},{" "}
                              {locations[currentIndex].lng.toFixed(6)}
                            </span>
                            <span className="text-xs font-medium text-slate-800 leading-tight">
                              {currentAddress}
                            </span>
                          </div>
                        </Tooltip>
                        <Popup offset={[0, -20]}>
                          <div className="flex flex-col max-w-[200px] whitespace-normal">
                            {locations[currentIndex].datetime &&
                              locations[currentIndex].datetime !== "-" && (
                                <span className="font-semibold text-sm mb-1">
                                  {locations[currentIndex].datetime}
                                </span>
                              )}
                            <span className="text-xs text-slate-600 mb-1 font-mono">
                              {locations[currentIndex].lat.toFixed(6)},{" "}
                              {locations[currentIndex].lng.toFixed(6)}
                            </span>
                            <span className="text-xs font-medium text-slate-800 leading-tight">
                              {currentAddress}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                </MapContainer>
              </div>
            </div>

            {/* Sidebar for upcoming route points */}
            <div className="lg:col-span-1 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col h-full max-h-[700px] overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Upcoming Route
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {upcomingLocations.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">
                    No route points to display.
                  </div>
                ) : (
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-slate-200 z-0"></div>

                    {upcomingLocations.map((loc, idx) => {
                      const isCurrent = idx === 0 && currentIndex >= 0;
                      return (
                        <div
                          key={`${loc.lat}-${loc.lng}-${idx}`}
                          className={cn(
                            "relative z-10 flex gap-4 p-3 rounded-lg border bg-white transition-colors",
                            isCurrent
                              ? "border-blue-300 shadow-sm ring-1 ring-blue-100"
                              : "border-slate-100 opacity-80",
                            "mb-3 last:mb-0",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ring-4 ring-white",
                              isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500 border border-slate-200",
                            )}
                          >
                            {loc.index + 1}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={cn(
                                  "font-semibold text-sm truncate",
                                  isCurrent
                                    ? "text-blue-900"
                                    : "text-slate-700",
                                )}
                              >
                                {loc.datetime && loc.datetime !== "-"
                                  ? loc.datetime
                                  : `Point ${loc.index + 1}`}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-slate-500 truncate">
                              {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Upload File</h4>
              <p className="text-slate-600 text-sm mt-1">
                Upload an Excel or CSV file containing latitude and longitude
                coordinates. They can be in separate columns or a single
                comma-separated column. Auto-extracts Date and Time to plot on
                timeline.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Select Date & Time
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Pick a specific point in the dropdown above the map. You can
                only pick dates available in the uploaded file.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Play Animation</h4>
              <p className="text-slate-600 text-sm mt-1">
                Click 'Play Target'. The map will intelligently animate your
                travel, adapting icons (Car/Bike/Walk) based on calculated speed
                and smoothly flying to each destination.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Frequently Asked Questions (FAQs)
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              1. How can I show my Excel data on Google Maps?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              It is very easy. Just upload your Excel file to our website. If
              your file has latitude and longitude, our tool will quickly show
              all the locations on a map.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              2. Do latitude and longitude need to be in the same column?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              No! You can have latitude and longitude in one single column, or
              in two different columns. Our tool understands both and works
              perfectly.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              3. Can I filter locations by date and time?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes. If your Excel file has dates and times, you can select a
              specific time. The map will only show the locations for the time
              you choose.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              4. What does the "Play Button" do?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              When you click the "Play" button, a moving arrow appears on the
              map. It shows you the exact path step-by-step, following the time
              and locations from your file.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              5. Who can use this tool?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Anyone who wants to track movement! It is very useful for tracking
              deliveries, travel routes, or investigating location patterns like
              tower data.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              6. Is my data safe on this website?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes, your data is 100% safe. Your Excel file is only used to show
              the map on your screen. We never save or share your data with
              anyone.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              7. Can it handle very large Excel files?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes! Even if your file has thousands of location points, our tool
              will show them on the map quickly without slowing down.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              8. Do I need to download any app or software?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              No. You do not need to download anything. Just open our website on
              your browser, upload your file, and start using it.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              9. Can I zoom in or see the street view?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes. Since our tool uses Google Maps, you can zoom in, zoom out,
              change to satellite view, or look at the street view just like a
              normal map.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              10. Does this work on mobile phones?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes, it works perfectly on both mobile phones and computers. You
              can use all the features easily from your smartphone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
