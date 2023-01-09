import validationResult from "..js/validation"
import  verifica  from "./validando.js";
import Processando from "./validacao.js";

function valida(validaevent = validationResult){
  console.log(`iNICIO DA VALIDAÇÃO`);
  const processando = new Processando(validaevent);
  processando
    .setValidacao(
      verifica
    )
    .process();
}
valida()
