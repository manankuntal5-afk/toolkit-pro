export default function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[900px] mx-auto py-24 px-6 md:px-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 my-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight border-b border-slate-100 pb-8">
        {title}
      </h1>
      <div className="text-lg text-slate-700 font-medium leading-relaxed max-w-none space-y-6">
        {children}
      </div>
    </div>
  );
}
