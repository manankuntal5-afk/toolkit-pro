const PDFParse = require('pdf-parse');

function render_page(pageData) {
    let render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        // we can actually do our X/Y mapping here!
        return JSON.stringify(textContent.items);
    });
}

function extract(buffer) {
    let options = {
        pagerender: render_page
    }
    return PDFParse(buffer, options);
}

module.exports = { extract };
