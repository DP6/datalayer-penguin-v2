import fs from 'fs'
//import data from './csv.js'
import dataLayer from '../dataLayer.json' assert {type: 'json'}


const chaves = Object.keys(dataLayer)
const cabecalio = chaves.join(',')

const data= dataLayer.map((elemento) => Object.values(elemento).join(',')).join('\n')

const conteudo = cabecalio + '\n' + data
const csv = conteudo.split('\n')
csv.shift();
const exportCsv = csv.join('\n')
//console.log(exportCsv)



try {
    fs.writeFileSync('export.csv', exportCsv);
    // file written successfully
  } catch (err) {
    console.error(err);
  }