import fs from 'fs'
import dat from './flattening.js'

const chaves = Object.keys(dat[0])
const cabecalio = chaves.join( ',')

const data = dat.map((elemento) => Object.values(elemento).join(',')).join('\n')

const conteudo = cabecalio + '\n' + data
console.log(conteudo)



try {
    fs.writeFileSync('test.csv', conteudo);
    // file written successfully
  } catch (err) {
    console.error(err);
  }