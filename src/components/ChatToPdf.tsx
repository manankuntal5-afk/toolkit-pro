import React, { useState } from "react";
import {
  Smartphone,
  UploadCloud,
  FileDown,
  Plus,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { cn } from "./Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ChatToPdf() {
  const [images, setImages] = useState<
    { url: string; file: File; base64?: string }[]
  >([]);
  const [txtText, setTxtText] = useState("");

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [chatDate, setChatDate] = useState("");

  const [platform, setPlatform] = useState("WhatsApp");
  const [pdfSize, setPdfSize] = useState<"a4" | "letter" | "legal">("a4");
  const [isExtracting, setIsExtracting] = useState(false);

  const [messages, setMessages] = useState<
    { sender: string; time: string; text: string }[]
  >([]);

  const [extractedData, setExtractedData] = useState<any>(null);

  const extractMetadata = async (
    fileType: "image" | "text",
    contents: string[],
  ) => {
    setIsExtracting(true);
    setExtractedData(null);
    try {
      const payload: any = {};
      if (fileType === "text") payload.textContent = contents[0];
      if (fileType === "image") payload.imagesBase64 = contents;

      const res = await fetch("/api/extract-chat-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.error) {
        alert("Error extracting data: " + data.error);
        return;
      }

      // Instead of setting directly, open the confirmation modal
      setExtractedData(data);
    } catch (e) {
      console.error("Failed to extract metadata", e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];

    if (files.length > 0) {
      const base64Promises = files.map((file) => {
        return new Promise<{ url: string; file: File; base64: string }>(
          (resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                url: URL.createObjectURL(file),
                file,
                base64: reader.result as string,
              });
            reader.readAsDataURL(file);
          },
        );
      });

      const newImagesData = await Promise.all(base64Promises);
      setImages((prev) => [
        ...prev,
        ...newImagesData.map((d) => ({
          url: d.url,
          file: d.file,
          base64: d.base64,
        })),
      ]);

      const base64Strings = newImagesData.map((d) => d.base64);
      extractMetadata("image", base64Strings);
    }
  };

  const handleTxtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTxtText(text);

    extractMetadata("text", [text.substring(0, 50000)]);
  };

  const handleMessageChange = (
    index: number,
    field: "sender" | "time" | "text",
    value: string,
  ) => {
    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[index] = { ...newMsgs[index], [field]: value };
      return newMsgs;
    });
  };

  const addMessage = () => {
    setMessages((prev) => [
      ...prev,
      { sender: senderName || "User", time: "", text: "" },
    ]);
  };

  const removeMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const applyDateData = (date: string) => {
    setChatDate(date);
  };

  const applyChatData = () => {
    if (extractedData?.messages && Array.isArray(extractedData.messages)) {
      setMessages((prev) => [...prev, ...extractedData.messages]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({ format: pdfSize });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let themeColor: [number, number, number] = [40, 40, 40]; // Default
    if (platform === "WhatsApp") themeColor = [37, 211, 102];
    else if (platform === "Facebook") themeColor = [24, 119, 242];
    else if (platform === "Instagram")
      themeColor = [225, 48, 108]; // gradient approx
    else if (platform === "Telegram") themeColor = [34, 158, 217];

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.text(`${platform} Chat Transcript`, pageWidth / 2, 15, {
      align: "center",
    });

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 25,
      head: [["Role", "Name", "Mobile Number/ID"]],
      body: [
        [
          "Receiver (Contact at top)",
          receiverName || "-",
          receiverPhone || "-",
        ],
        ["Sender (Right-side/You)", senderName || "-", senderPhone || "-"],
      ],
      theme: "grid",
      headStyles: { fillColor: themeColor },
    });

    doc.text(
      `Recorded Date/Time: ${chatDate || "-"}`,
      14,
      (doc as any).lastAutoTable.finalY + 10,
    );

    let y = (doc as any).lastAutoTable.finalY + 20;

    // Ordered Chat Messages
    if (messages.length > 0) {
      const msgsBody: any[][] = [];
      messages.forEach((m) =>
        msgsBody.push([m.time || "-", m.sender || "-", m.text || "-"]),
      );

      autoTable(doc, {
        startY: y,
        head: [["Time", "User", "Message"]],
        body: msgsBody,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 4, lineColor: [230, 230, 230] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35, fontStyle: "bold" },
          2: { cellWidth: pageWidth - 88 }, // 14 padding left/right (28), plus 60 for other cols, minus table border
        },
        headStyles: { fillColor: [80, 80, 80], textColor: [255, 255, 255] },
        didParseCell: (hookData: any) => {
          if (hookData.section === "body") {
            const senderCell = hookData.row.raw[1];
            if (typeof senderCell === "string") {
              const s = senderCell.toLowerCase();
              if (
                senderName &&
                s.includes(senderName.toLowerCase().split(" ")[0])
              ) {
                // Sender (like "me") - light green theme (e.g., WhatsApp style)
                hookData.cell.styles.fillColor =
                  platform === "WhatsApp" ? [220, 248, 198] : [225, 245, 254];
              } else {
                // Receiver - light gray
                hookData.cell.styles.fillColor = [245, 245, 245];
              }
            }
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else if (txtText) {
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(txtText, pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 4;
    }

    // Images
    if (images.length > 0) {
      let currentY = Number(y) + 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      images.forEach((img, idx) => {
        if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(`Original Screenshot ${idx + 1}:`, 14, currentY);
        currentY += 5;

        if (img.base64) {
          const imgFormatMatch = img.base64.match(/^data:image\/(\w+);/);
          const rawFormat = imgFormatMatch
            ? imgFormatMatch[1].toUpperCase()
            : "JPEG";
          const imgFormat = rawFormat === "JPG" ? "JPEG" : rawFormat;
          const cleanBase64 = img.base64.replace(
            /^data:image\/\w+;base64,/,
            "",
          );

          // Render with reasonable aspect ratio matching typical screenshot
          // E.g., width 90, height 180 depending on remaining page space
          const renderHeight = Math.min(180, pageHeight - currentY - 10);
          const renderWidth = renderHeight * (90 / 180);

          doc.addImage(
            cleanBase64,
            imgFormat,
            14,
            currentY,
            renderWidth,
            renderHeight,
            undefined,
            "FAST",
          );
          currentY += renderHeight + 10;
        } else {
          currentY += 15;
        }
      });
    }

    doc.save(`Transcript_${platform}_${senderName || "chat"}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">
                Review Extracted Data
              </h2>
              <button
                onClick={() => setExtractedData(null)}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <p className="text-sm text-slate-600 mb-4">
                We used AI (Google Lens) to extract text from your screenshot.
                Please confirm who these details belong to so we can fill the
                form automatically.
              </p>

              {/* Names */}
              <div className="border rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">
                  Names Found
                </h3>
                {extractedData.foundNames &&
                extractedData.foundNames.length > 0 ? (
                  <div className="space-y-3">
                    {extractedData.foundNames.map((name: string, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border rounded-lg"
                      >
                        <span className="font-medium text-sm text-slate-800">
                          {name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSenderName(name)}
                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${senderName === name ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                          >
                            Is Sender
                          </button>
                          <button
                            onClick={() => setReceiverName(name)}
                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${receiverName === name ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                          >
                            Is Receiver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600">
                    No names found in screenshot.
                  </p>
                )}
              </div>

              {/* Numbers */}
              <div className="border rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">
                  Numbers / IDs Found
                </h3>
                {extractedData.foundNumbers &&
                extractedData.foundNumbers.length > 0 ? (
                  <div className="space-y-3">
                    {extractedData.foundNumbers.map(
                      (num: string, i: number) => (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border rounded-lg"
                        >
                          <span className="font-medium text-sm text-slate-800">
                            {num}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSenderPhone(num)}
                              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${senderPhone === num ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                            >
                              Is Sender No.
                            </button>
                            <button
                              onClick={() => setReceiverPhone(num)}
                              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${receiverPhone === num ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                            >
                              Is Receiver No.
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600">
                    No numbers found in screenshot.
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="border rounded-xl p-4 bg-white">
                <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">
                  Dates Found
                </h3>
                {extractedData.foundDates &&
                extractedData.foundDates.length > 0 ? (
                  <div className="space-y-3">
                    {extractedData.foundDates.map((date: string, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border rounded-lg"
                      >
                        <span className="font-medium text-sm text-slate-800">
                          {date}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyDateData(date)}
                            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${chatDate === date ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                          >
                            Set as Chat Date
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600">
                    No dates found in screenshot.
                  </p>
                )}
              </div>

              {/* Chats */}
              <div className="border rounded-xl p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-800 mb-2 border-b pb-2 flex justify-between items-center">
                  Extracted Chat Messages
                  {extractedData.messages &&
                    extractedData.messages.length > 0 && (
                      <button
                        onClick={applyChatData}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
                      >
                        <Check className="w-4 h-4" /> Fetch All Chats
                      </button>
                    )}
                </h3>
                {extractedData.messages && extractedData.messages.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {extractedData.messages.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col border border-slate-200 bg-white p-3 rounded-lg text-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500"
                      >
                        <div className="mb-2">
                          <span className="text-slate-500 mr-2 text-xs font-semibold uppercase">
                            Message:
                          </span>
                          <span className="font-medium text-slate-800">
                            {m.text}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t pt-2 mt-1">
                          <span className="text-slate-500 text-xs font-semibold uppercase">
                            Who sent this?
                          </span>
                          <select
                            value={m.sender}
                            onChange={(e) => {
                              const newExtractedData = { ...extractedData };
                              newExtractedData.messages[i].sender =
                                e.target.value;
                              setExtractedData(newExtractedData);
                            }}
                            className="border border-slate-300 rounded p-1 text-sm bg-slate-50 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Sender (You)">Sender (You)</option>
                            <option value="Receiver (Them)">
                              Receiver (Them)
                            </option>
                            {senderName && (
                              <option value={senderName}>
                                {senderName} (Sender)
                              </option>
                            )}
                            {receiverName && (
                              <option value={receiverName}>
                                {receiverName} (Receiver)
                              </option>
                            )}
                            <option value={m.sender}>
                              Suggested: {m.sender}
                            </option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    No messages could be extracted.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 sticky bottom-0 z-10 flex justify-end">
              <button
                onClick={() => setExtractedData(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              Select Social Media Platform
            </label>
            <div className="flex gap-4 flex-wrap">
              {["WhatsApp", "Facebook", "Instagram", "Telegram", "Other"].map(
                (p) => (
                  <label
                    key={p}
                    className={cn(
                      "px-4 py-2 border rounded-lg cursor-pointer transition-colors",
                      platform === p
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-medium"
                        : "bg-white text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={p}
                      checked={platform === p}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="hidden"
                    />
                    {p}
                  </label>
                ),
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              PDF Export Size
            </label>
            <div className="flex gap-4 flex-wrap">
              {["a4", "letter", "legal"].map((s) => (
                <label
                  key={s}
                  className={cn(
                    "px-4 py-2 border rounded-lg cursor-pointer transition-colors capitalize",
                    pdfSize === s
                      ? "bg-slate-800 border-slate-900 text-white font-medium"
                      : "bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="pdfSize"
                    value={s}
                    checked={pdfSize === s}
                    onChange={(e) => setPdfSize(e.target.value as any)}
                    className="hidden"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-medium text-slate-700 mb-3 flex items-center justify-between">
              Upload TXT Chat Export
              <label className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-200">
                Select
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleTxtUpload}
                  className="hidden"
                />
              </label>
            </h4>
            {txtText ? (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                ✓ TXT File loaded ({txtText.length} characters)
              </div>
            ) : (
              <div className="text-sm text-slate-400">No txt file uploaded</div>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-medium text-slate-700 mb-3 flex items-center justify-between">
              Upload Screenshots
              <label className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-200">
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </h4>
            {images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    className="h-16 w-16 object-cover rounded border"
                    alt="Screenshot"
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                No screenshots uploaded
              </div>
            )}
          </div>
        </div>

        {isExtracting ? (
          <div className="text-center p-8 bg-blue-50 rounded-xl border border-blue-100 mb-8 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-blue-800 font-medium">
              Extracting names, numbers, and dates automatically using AI
              (Google Lens)...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">
                Sender Details
              </h3>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Manual entry if not found"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Mobile Number / ID
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Manual entry if not found"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">
                Receiver Details
              </h3>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Manual entry if not found"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Mobile Number / ID
                </label>
                <input
                  type="text"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Manual entry if not found"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
            Chat Date & Time
          </label>
          <input
            type="text"
            placeholder="Manual entry if not found (e.g. 15-Aug-2023 10:00 AM)"
            value={chatDate}
            onChange={(e) => setChatDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none max-w-md"
          />
        </div>

        <div className="mb-8 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500">
              Chat Transcript Messages
            </label>
            <button
              onClick={addMessage}
              className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-slate-500 pb-4">
                No messages extracted yet. Upload screenshots/text to
                Auto-extract, or click 'Add Row' to manually enter messages.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 border border-slate-200 bg-slate-50 p-2 rounded-lg"
                >
                  <input
                    type="text"
                    placeholder="Time"
                    value={msg.time}
                    onChange={(e) =>
                      handleMessageChange(i, "time", e.target.value)
                    }
                    className="w-full sm:w-24 p-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Sender Name"
                    value={msg.sender}
                    onChange={(e) =>
                      handleMessageChange(i, "sender", e.target.value)
                    }
                    className="w-full sm:w-32 p-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:outline-none font-medium text-slate-700"
                  />
                  <textarea
                    placeholder="Message text..."
                    value={msg.text}
                    onChange={(e) =>
                      handleMessageChange(i, "text", e.target.value)
                    }
                    rows={1}
                    className="w-full flex-1 p-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => removeMessage(i)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded self-start sm:self-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex justify-end">
          <button
            onClick={generatePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            Generate Court Ready PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How to use it</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Select Platform</h4>
              <p className="text-slate-600 text-sm mt-1">
                Select if this chat is from WhatsApp, Facebook, Instagram, or
                another platform.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Upload Screenshots & Extract via AI
              </h4>
              <p className="text-slate-600 text-sm mt-1">
                Upload the screenshots. We use AI (Google Lens like) to read the
                Sender details on the left, Receiver details on the right,
                Dates, and individual Chat texts so you don't have to fill
                anything manually.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Generate PDF</h4>
              <p className="text-slate-600 text-sm mt-1">
                Review the confirmed text, modify it if necessary, and click the
                Generate PDF button to get a correctly formatted document for
                court use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
