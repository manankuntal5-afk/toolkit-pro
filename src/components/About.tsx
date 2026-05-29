import React from "react";
import { Shield, Zap, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Empowering Your Digital Tasks
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">
          ToolBox Pro is built with a singular vision: to make everyday internet
          utilities fast, completely secure, and beautifully simple to use.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Lightning Fast
          </h3>
          <p className="text-slate-600 leading-relaxed">
            No waiting. No complex setups. Our tools run primary logic instantly
            in your browser.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Privacy First
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Your files never leave your device unless necessary. We don't store
            your sensitive data.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Bank-Grade Security
          </h3>
          <p className="text-slate-600 leading-relaxed">
            All data parsing is done using modern, secure processing pipelines.
            No shady business.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Accessible Anywhere
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Works perfectly on your mobile, tablet, or desktop. A true
            responsive toolbox.
          </p>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-blue-200">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to simplify your workflow?
        </h2>
        <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto font-medium">
          Join thousands of users who trust ToolBox Pro for their daily PDF,
          Image, and Data automation needs.
        </p>
        <Link to="/" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm">
          Explore All Tools
        </Link>
      </div>
    </div>
  );
}
