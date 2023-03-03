import fs from 'fs'
import dat from './flattening.js'

const chaves = Object.keys(dat[0])
const cabecalio = chaves.join( ',')
//console.log(cabecalio)
const data = dat.map((elemento) => Object.values(elemento).join(',')).join('\n')
//console.log(data)

const conteudo = cabecalio + '\n' + data
console.log(conteudo)



try {
    fs.writeFileSync('test.csv', conteudo);
    // file written successfully
  } catch (err) {
    console.error(err);
  }