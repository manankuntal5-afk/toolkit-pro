const fs = require('fs');
const path = require('path');

const components = [
    'PhotoMetadata.tsx',
    'ImageCompressor.tsx',
    'QrChecker.tsx',
    'WhatsAppChecker.tsx',
    'DocumentTranslator.tsx',
    'BankDecoder.tsx',
    'PdfRedactor.tsx',
    'GeoMapAnimator.tsx',
    'ChatToPdf.tsx',
    'CommonDataFinder.tsx'
];

const replacementTemplate = `<div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0eb2a8] rounded-xl w-full max-w-[900px] min-h-[300px] p-8 relative flex flex-col items-center justify-center cursor-pointer shadow-md hover:bg-[#0c9d94] transition-all duration-300 overflow-hidden group mx-auto mb-8"
              >
                {/* Dashed white inner border */}
                <div className="absolute inset-2 border-2 border-dashed border-white/40 pointer-events-none rounded-lg"></div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={__ON_CHANGE__} 
                  accept="__ACCEPT__"
                  __MULTIPLE__
                  className="hidden" 
                />
                
                <div className="mb-6 z-10 transform group-hover:scale-105 transition-transform duration-300">
                  <svg width="72" height="72" viewBox="0 0 84 84" fill="none" stroke="white" strokeWidth="1.5">
                     <path d="M22 18v52h44V34L46 18H22z" strokeLinejoin="round"/>
                     <path d="M46 18v16h16" strokeLinejoin="round"/>
                     <rect x="34" y="44" width="20" height="12" rx="2" fill="white" stroke="none"/>
                     <text x="44" y="52" textAnchor="middle" fill="#0eb2a8" stroke="none" fontSize="10" fontWeight="bold">FILE</text>
                  </svg>
                </div>
                
                <div className="flex items-center shadow-lg rounded bg-white hover:bg-gray-50 h-[50px] text-[#1a1a1a] z-10 font-bold text-[16px] transform focus:scale-95 transition-transform">
                  <div className="flex items-center px-6 h-full">
                     <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                     </svg>
                     CHOOSE FILE
                  </div>
                </div>
                <p className="text-white text-[15px] mt-4 z-10 font-medium">or drop files here</p>
              </div>`;

for (const comp of components) {
    const filepath = path.join(__dirname, 'src', 'components', comp);
    if (!fs.existsSync(filepath)) continue;
    
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Find <div onClick={() => fileInputRef.current?.click()} ... > ... </div>
    // Using regex, match from <div onClick... up to the first </div>
    const regex = /(<\s*div[^>]*onClick=\{\(\)\s*=>\s*fileInputRef\.current\?\.click\(\)\}[^>]*>)([\s\S]*?)(<\/\s*div\s*>)/;
    const match = content.match(regex);
    
    if (match) {
        const fullMatch = match[0];
        const inner = match[2];
        
        const onChangeMatch = inner.match(/onChange=\{([^\}]+)\}/);
        const acceptMatch = inner.match(/accept="([^"]+)"/);
        const multipleMatch = inner.match(/multiple/);
        
        const onChange = onChangeMatch ? onChangeMatch[1] : 'handleFileUpload';
        const accept = acceptMatch ? acceptMatch[1] : '*/*';
        const multiple = multipleMatch ? 'multiple' : '';
        
        const newBlock = replacementTemplate
            .replace('__ON_CHANGE__', '{' + onChange + '}')
            .replace('__ACCEPT__', accept)
            .replace('__MULTIPLE__', multiple);
            
        content = content.replace(fullMatch, newBlock);
        fs.writeFileSync(filepath, content);
        console.log("Updated " + comp);
    }
}
