const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const dropzoneTemplate = `
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#0eb2a8] rounded-xl w-full max-w-[900px] h-[340px] relative flex flex-col items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-[#0c9d94] transition-all duration-300 overflow-hidden group mx-auto"
        >
          {/* Dashed white inner border like smallpdf */}
          <div className="absolute inset-2 border-2 border-dashed border-white/40 pointer-events-none rounded-lg"></div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="__ACCEPT__" 
            className="hidden" 
          />
          
          <div className="mb-8 mt-2 transform group-hover:scale-105 transition-transform duration-300">
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" stroke="white" strokeWidth="1.5">
               <path d="M22 18v52h44V34L46 18H22z" strokeLinejoin="round"/>
               <path d="M46 18v16h16" strokeLinejoin="round"/>
               <rect x="34" y="44" width="20" height="12" rx="2" fill="white" stroke="none"/>
               <text x="44" y="52" textAnchor="middle" fill="#0eb2a8" stroke="none" fontSize="10" fontWeight="bold">FILE</text>
            </svg>
          </div>
          
          <div className="flex items-center shadow-lg rounded bg-white hover:bg-gray-50 h-[56px] text-[#1a1a1a] z-10 font-bold text-[18px] transform focus:scale-95 transition-transform">
            <div className="flex items-center px-6 h-full cursor-pointer">
               <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
               </svg>
               CHOOSE FILES
            </div>
          </div>
          <p className="text-white text-[16px] mt-6 z-10 font-medium">or drop files here</p>
        </div>
`;

let replacedFiles = 0;
for (const file of files) {
  if (file === 'PdfToCsv.tsx') continue;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // We are looking for simple empty state dropzones.
  // Generally they look like: {!file ? ( <div onClick... > <input type="file" ... /> ... </div> ) : 
  // Let's use a regex to match {!file ? ( ... ) : 
  // Oh wait, sometimes it's if (!file) return ( ... )
  // Let's print out how they are structured.
}
