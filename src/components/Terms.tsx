import React from "react";

export default function Terms() {
  return (
    <div className="max-w-[900px] mx-auto py-20 px-6 md:px-12 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 my-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
        Terms & Conditions
      </h1>
      <p className="text-slate-500 font-medium mb-12 border-b border-slate-100 pb-8">
        Last Updated: October 2023
      </p>

      <div className="prose prose-lg prose-slate text-slate-700 font-medium leading-relaxed max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using ToolBox Pro, you accept and agree to be bound
            by the terms and provision of this agreement. In addition, when
            using these particular services, you shall be subject to any posted
            guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            2. Permitted Use
          </h2>
          <p>
            You agree to use our tools only for lawful purposes. You are
            strictly prohibited from using the platform to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-blue-500">
            <li>Process illegal, offensive, or malicious content.</li>
            <li>
              Attempt to reverse engineer, decompile, or hack the service.
            </li>
            <li>Automate requests via undocumented APIs or scraping bots.</li>
            <li>Infringe upon the intellectual property of others.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            3. Fair Usage Policy
          </h2>
          <p>
            While our tools are free to use, we implement rate limiting to
            ensure fair access for everyone. Excessive use that damages the
            server infrastructure or degrades the experience for other users may
            result in temporary IP blocks.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            4. Disclaimer of Warranties
          </h2>
          <p>
            The service is provided "as is". We make no warranties, expressed or
            implied, and hereby disclaim and negate all other warranties
            including, without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property.
          </p>
        </section>
      </div>
    </div>
  );
}
