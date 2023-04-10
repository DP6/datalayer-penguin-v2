import fs from 'fs';
import PdfPrinter from 'pdfmake';

import fonts from './pdfMake_fonts.json' assert {type: 'json'}; 
import docDefinition from './docDefinition.json' assert {type: 'json'}; 

//import docDefinition from './docDefinition.json'
//import fonts from './pdfMake_fonts.json'

const printer = new PdfPrinter(fonts)

let data = 
  {
    dataLayer: undefined,
    objectName: undefined,
    keyName: undefined,
    status: undefined,
    message: undefined,
    partialErrors: { ocurrences: 0, trace: '' }
  } 



let pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('document.pdf', data)); 
pdfDoc.end();