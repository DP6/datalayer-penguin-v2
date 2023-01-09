import validationResult from "../js/validation.js";

class Processando{
    validando = [Function]
    constructor(){
        this.validationResult = validationResult;
        this.validando = []
        
    }


    setValidacao(validando = [Function]){
        this.validando = validando
        return this;
    }

    process(){
        let validacoes = [this.validando];
        
        validacoes = validacoes.map((valida = Function ,index) => {
            return () => {
                valida(this.validationResult, validacoes[index + 1])

        };
        });
        validacoes[0]();
    }
}

export default Processando