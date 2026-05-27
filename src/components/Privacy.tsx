import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-[900px] mx-auto py-20 px-6 md:px-12 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 my-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
        Privacy Policy
      </h1>
      <p className="text-slate-500 font-medium mb-12 border-b border-slate-100 pb-8">
        Last Updated: October 2023
      </p>

      <div className="prose prose-lg prose-slate text-slate-700 font-medium leading-relaxed max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            1. Introduction
          </h2>
          <p>
            Your privacy is critically important to us. At ToolBox Pro, we have
            a few fundamental principles: We don't ask you for personal
            information unless we truly need it. We don't share your personal
            information with anyone except to comply with the law, develop our
            products, or protect our rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            2. File Processing
          </h2>
          <p>
            Many of our tools (like PDF and Image converters) operate entirely
            within your browser. For tools that require server processing, files
            are strictly uploaded over secure SSL/HTTPS connections, processed
            in memory, and immediately discarded upon completion.
            <strong className="text-slate-900">
              {" "}
              We do not store, back up, or analyze your files.
            </strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            3. Data We Collect
          </h2>
          <p>
            We collect non-personally-identifying information of the sort that
            web browsers and servers typically make available, such as the
            browser type, language preference, referring site, and the date and
            time of each visitor request. Our purpose in collecting
            non-personally identifying information is to better understand how
            our visitors use the website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            4. Contacting Us
          </h2>
          <p>
            If you have questions about deleting or correcting your personal
            data, formatting issues, or specific privacy inquiries, please feel
            free to contact our support team.
          </p>
        </section>
      </div>
    </div>
  );
}
