import React, { useState } from "react";
import {
  UserX,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "./Layout";

type Platform =
  | "facebook"
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "snapchat"
  | "other";

export default function FakeSocialChecker() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isFake: boolean;
    username?: string;
    profileName?: string;
    creationDate?: string;
    followers?: string;
    activity?: string;
    birthDate?: string;
    mobileNumber?: string;
    location?: string;
    bio?: string;
    otherData?: string;
    explanation?: string;
    profileImageUrl?: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/check-fake-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url }),
      });

      if (!res.ok) throw new Error("Failed to analyze profile.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    { id: "snapchat", name: "Snapchat", icon: <UserX className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <form
          onSubmit={handleCheck}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`Paste ${platforms.find((p) => p.id === platform)?.name || platform} profile link or username here...`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center justify-center min-w-[150px]"
          >
            {loading ? "Checking..." : "Check Profile"}
          </button>
        </form>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Select Social Media Platform:
          </label>
          <div className="flex flex-wrap gap-3">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                  platform === p.id
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-medium scale-105 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50",
                )}
                onClick={() => setPlatform(p.id as Platform)}
              >
                {p.icon}
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 border-t border-slate-100 pt-10">
            <div
              className={cn(
                "rounded-2xl p-6 md:p-8 border-2 mb-6",
                result.isFake
                  ? "bg-red-50/50 border-red-200"
                  : "bg-blue-50/50 border-blue-200",
              )}
            >
              <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                {result.profileImageUrl && (
                  <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto md:mx-0 bg-slate-200">
                    <img
                      src={result.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${result.profileName || "User"}&background=random`;
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                    {result.isFake ? (
                      <>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        <h3 className="text-2xl font-bold text-red-600">
                          Warning: Fake account
                        </h3>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                        <h3 className="text-2xl font-bold text-blue-600">
                          The account is real
                        </h3>
                      </>
                    )}
                  </div>
                  {(result.bio || result.location) && (
                    <div className="bg-white/50 rounded-lg p-4 text-center md:text-left">
                      {result.bio && (
                        <p className="text-slate-700 italic text-sm mb-1">
                          "{result.bio}"
                        </p>
                      )}
                      {result.location && (
                        <p className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-1">
                          📍 {result.location}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    User Name
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.username || "Not Available"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Profile Name
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.profileName || "Not Available"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Creation/Open Date
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.creationDate || "Not Available"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Followers
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.followers || "Not public"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Activity Context
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.activity || "Unknown"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Birth Date
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.birthDate || "Not public"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Mobile Number
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.mobileNumber || "Not public"}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sm:col-span-2 lg:col-span-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Other Data
                  </span>
                  <span className="text-base font-medium text-slate-900">
                    {result.otherData || "No other public data"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2 px-2">
                  Analysis (Simple English)
                </span>
                <p className="text-slate-800 leading-relaxed bg-white p-5 rounded-xl border border-slate-200/60 shadow-inner whitespace-pre-wrap font-medium">
                  {result.explanation || "No detailed analysis provided."}
                </p>
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
              <h4 className="font-semibold text-slate-900">Select Platform</h4>
              <p className="text-slate-600 text-sm mt-1">
                Select the social media platform where the suspicious account is
                located.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Paste Link</h4>
              <p className="text-slate-600 text-sm mt-1">
                Copy the profile link or username of the suspicious person and
                paste it in the box.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Read the Result</h4>
              <p className="text-slate-600 text-sm mt-1">
                Our AI will check open-source data to determine when it was
                created, how many followers it has, and warn you if it's likely
                a scam account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
