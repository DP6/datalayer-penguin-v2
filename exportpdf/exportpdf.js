import dataLayer from '../dataLayer.json' assert {type: 'json'};
import fs from 'fs';
import pdfMake from 'pdfmake';
import fonts from './pdfMake_fonts.json' assert {type: 'json'}; 
import docDefinition from './docDefinition.json' assert {type: 'json'}; 


const printer = new pdfMake(fonts);



dataLayer.forEach((dataObject) =>{
  if(dataObject){
    dataObject.dlObject = dataObject.dlObject.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/g, '').split(',').join('');
    }

  
 
    docDefinition.content[6].table.body.push([
      {
        text: `${dataObject.status}`,
        alignment: 'center',
      },
      {
        text: `${dataObject.message}`,
        alignment: 'center',
      },
      {
        text: `${dataObject.dlObject}`
      }
    ]);
    pdfMake.tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) {
          if (i === 0 || i === node.table.body.length) {
           return 0;
          }
          return i === node.table.headerRows ? 2 : 1;
        },
        vLineWidth: function (i) {
          return 0;
        },
        hLineColor: function (i) {
          return i === 1 ? 'black' : '#aaa';
        },
        paddingLeft: function (i) {
          return i === 0 ? 0 : 8;
        },
        paddingRight: function (i, node) {
         return i === node.table.widths.length - 1 ? 0 : 8;
        },
      },
    };
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(`document.pdf`));
  pdfDoc.end()
  

});