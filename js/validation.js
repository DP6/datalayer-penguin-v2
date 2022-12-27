let fullValidation = [];
let partialErrors = {ocurrences: 0, trace: ''};

/**
 * @function - Função responsável por mostrar os resultados da validação.
 * @param {object} dataLayer - dataLayer do site.
 * @param {string} objectName - nome do objeto.
 * @param {string} keyName - nome da chave do objeto.
 * @param {string} status - status da validação.
 * @param {string} message - mensagem com o resultado da validação.
 * @return {object} - retorna um array de objeto com o resultado da validação.
 */

function validationResult(status, message, dataLayer, objectName, keyName){

  fullValidation.push({
    dataLayer: dataLayer,
    objectName: objectName,
    keyName: keyName,
    status: status,
    message: message,
    partialErrors: partialErrors
  });
};

/**
 * @function - valida se os eventos do dataLayer bate com os eventos do schema.
 * @param {object} schemaItem - é o caminho do schema, no caso schema.array.items, retorna todo o objeto do schema após o items.
 * @param {object } dataLayer - é o objeto do dataLayer do site.
 * @return {boolean} - retorna true (no caso o evento validado).
 */

function eventValidation(schemaItem,dataLayer){
  for(i=0; i < schemaItem.length; i++){ // for percorre o schema para ver a quantidade de eventos que precisa ter no schema.
    let valid = ajv.validate(schemaItem[i],dataLayer); // AJV está validando o Schema e o dataLayer para confirmar que está correto.
    if (valid) {
      validationResult('Sucess', JSON.stringify(dataLayer,null,2)) // resultado da validação.
      schemaItem.splice(i,1) // retira do schema os eventos validados
      return true
    };
  };
};


/**
 * @function - Valida os subniveis da propriedade (objetos dentro de outro objeto)
 * @param {object} schemaNestedProp  propriedades do schema
 * @param {string} errorMessage 
 * @param {object} dataLayerNestedProp  propriedades do dataLayer
 * @param {number} schemaIndex
 * @param {array} schemaArray
 * @param {object} dataLayer
 */

function nestedPropValidation(schemaNestedProp, errorMessage, dataLayerNestedProp, schemaIndex, schemaArray, dataLayer){
  let dataLayerObj = JSON.parse(JSON.stringify(dataLayerNestedProp));
  let schemaNest = JSON.parse(JSON.stringify(schemaNestedProp));
  let verify_required = Object.keys(schemaNest).indexOf('required');

  if(verify_required === -1){
    let found = schemaNest.contains.required.indexOf(errorMessage.params.missingProperty); // checa se o schema tem a propriedade descrina na mensagem de erro
    
    if(found > 1) {
      let dlNestedProp = errorMessage.params.missingProperty;
      schemaNest.contains.required = schemaNest.contains.required.filter((keyword) => keyword === dlNestedProp) // remove do required as propriedades que não são iguais á que está no dataLayerObj
      
      for(prop in schemaNest.contains.properties){
        if(prop !== dlNestedProp){
          delete schemaNest.contains.properties[prop]; // remove do required do schema todas as propriedades que não estão no dlNestedProp
        }
      }
      let schemaEmpty = Object.entries(schemaNest.contains.properties).length === 0 && dataLayerNestedProp.constructor === Object // garante que o required do schema e o dataLayer não ficou vazio

      if(schemaNest.contains.required.length > 0 && !schemaEmpty && Object.keys(schemaNest.contains.properties)[0] !== 'event'){
        validationResult('ERROR', `Hit sent without the following property: ${errorMessage.params.missingProperty}`, JSON.stringify(dataLayer,null,2), '', errorMessage.params.missingProperty);
        if(errorMessage.dataPath.indexOf(Object.keys(schemaArray[schemaIndex].properties)[1]) > -1){
          schemaArray.splice(schemaIndex,1)
        }
      }
    }else{
      for(prop in schemaNest.properties){
        if(dataLayerObj[prop] && typeof dataLayerObj[prop] !== 'string' && typeof dataLayerObj[prop] !== 'number' && typeof dataLayerObj[prop] !== 'array'){
          let schemaProps = schemaNest.properties[prop]
          nestedPropValidation(schemaProps, errorMessage, dataLayerObj[prop], schemaIndex, schemaArray, dataLayer);
        }
      }
    }
  }else{
    let found = schemaNest.required.indexOf(errorMessage.params.missingProperty)

    if(found > -1){
      if(Object.keys(dataLayerObj).length > 1){
        dlNestedProp = Object.keys(dataLayerObj)[1];
      }else{
        dlNestedProp = Object.keys(dataLayerObj)[0];
      }
      schemaNest.required = schemaNest.required.filter((keyword) => keyword === dlNestedProp)

      for(prop in schemaNest.properties){
        if(prop !== dlNestedProp){
          delete schemaNest.properties[prop]
        }
      }
      let schemaEmpty = Object.entries(schemaNest.properties).length === 0 && dataLayerNestedProp.constructor === Object

      if(schemaNest.required.length > 0 && !schemaEmpty && Object.keys(schemaNest.properties)[0] !== 'event'){
        validationResult('ERROR', `Hit ${errorMessage.dataPath} sent without the following property: ${errorMessage.params.missingProperty}`, JSON.stringify(dataLayer,null,2), errorMessage.dataPath, errorMessage.params.missingProperty);
        if(schemaIndex < schemaArray.length && errorMessage.dataPath.indexOf(Object.keys(schemaArray[schemaIndex].properties)[1]) > -1){
          schemaArray.splice(schemaIndex, 1);
        }
      }
    }else{
      for(prop in schemaNest.properties){
        if(dataLayerObj[prop] && typeof dataLayerObj[prop] !== 'string' && typeof dataLayerObj[prop] !== 'number' && typeof dataLayerObj[prop] !== 'array'){
          let schemaProps = schemaNest.properties[prop]
          nestedPropValidation(schemaProps, errorMessage, dataLayerObj[prop], schemaIndex, schemaArray, dataLayer);
        }
      }
    }
  }
}

/**
 * @function - responsável por checar propriedades que estão faltando
 * @param {object} schemaItem
 * @param {object} dataLayer
 * @return {object} - retorna um objeto contendo a mensagem informando a propriedade que está faltando, se não estiver faltando nenhuma ela revalida o schema.
 */

function checkMissingProperty(schemaItem, dataLayer){
  schemaItem.forEach((item,index,array) => { 
    // index - retorna o index do array
    // item - retorna o objeto dataLayer após o item
    // array - retorna um array contando o item
    let valid = ajv.validate(item,dataLayer);
    let errors = ajv.errors;

    if(!valid) {
      errors.filter((error) => error.schema.constructor === Object && error.keyword === 'required').map((eachError) => {
        let errorMessage = JSON.parse(JSON.stringify(eachError));
        let schemaNestedProp = JSON.parse(JSON.stringify(item));
        let isErrorDataEmpty = Object.entries(errorMessage.data).length === 0 && errorMessage.data.constructor === Object;
        
        if(isErrorDataEmpty){
          validationResult('ERROR', `HIT sent without the following property: ${errorMessage.params.missingProperty}`, JSON.stringify(dataLayer,null,2), errorMessage.dataPath, errorMessage.params.missingProperty);
        } else{
          nestedPropValidation(schemaNestedProp, errorMessage, dataLayer, index, array, dataLayer)
        }
      });
    }
  });
}

/**
 * @function - responsavel por checar os erros que possue no schema
 * @param {object} schemaItem
 * @param {object} dataLayer
 * @return {object} retorna um objeto com os erros do schema
 */

function errorsPerSchema(schemaItem, dataLayer){
  schemaItem.forEach((item,index) => {
    let valid = ajv.validate(item, dataLayer);
    let errors = ajv.errors;

    if(!valid && item.required[1] == Object.keys(dataLayer)[1]){
      errors.filter((error) => {
        if(error.keyword === 'enum' || error.keyword === 'pattern' || error.keyword === 'type') return error;}).map((eachError) => {
          switch(eachError.keyword){
            case 'pattern': 
              validationResult('WARNING', `${eachError.dataPath.replace(/^\./g, '')} ${eachError.message}, but hit send: ${eachError.data}`, JSON.stringify(dataLayer,null,2), eachError.dataPath, eachError.data);
              break;

            case 'enum':
              validationResult('WARNING', `${eachError.dataPath.replace(/^\./g, '')} ${eachError.message}: ${eachError.schema.length > 1 ? eachError.schema.join(', '): eachError.schema[0]}, but hit send: ${eachError.data}`, JSON.stringify(dataLayer,null,2), eachError.dataPath, eachError.data);
              break;
            
            case 'type':
              validationResult('WARNING', `${eachError.dataPath.replace(/^\./g, '')} ${eachError.message}`, JSON.stringify(dataLayer,null,2), eachError.dataPath, eachError.message);
              break;

            default:
              break
          }
        });
      schemaItem.splice(index, 1);
    }
  });
}



/**
 * @function - verifica se existe algum evento faltando no schema
 * @param {object} schemaItem
 * @return {string,object} retorna uma mensagem informando que o evento não foi validado e o objeto contendo o evento
 */

function checkMissingEvents(schemaItem) {
  let missingEvents = parseToDataLayer(schemaItem);
  missingEvents.map((event) => {
    validationResult('ERROR', `Hit not validated or missing during test`, JSON.stringify(event, null,2))});
}

/**
 * @function - faz a validação completa dos schemas
 * @param {object} schema Json com as regras de validação da camada
 * @param {object} dataLayer Json com as chaves da camada de dados
 * @param {function} callback Função que será executada após o sucesso da validação, como parâmetro um array com o status das validações
 * @return {array} retorna um array com os resultados da validação
 */

function validate(schema, dataLayer, callback){
  fullValidation = [];
  let schemaItem = schema.array.items;
  let isSchemaEmpty = schemaItem.length === 0
  let isObjEmpty = Object.entries(dataLayer).length === 0 && dataLayer.constructor === Object;

  if(isSchemaEmpty){
    validationResult('ERROR', `No more items to validate`, JSON.stringify(dataLayer));
  }else if(!eventValidation(schemaItem, dataLayer) && !isObjEmpty){
    checkMissingProperty(schemaItem, dataLayer);
    errorsPerSchema(schemaItem, dataLayer);
  }else if(isObjEmpty){
    checkMissingEvents(schemaItem, dataLayer);
  }

  callback(fullValidation)
  return(fullValidation)
}

module.exports(
  validate,
  checkMissingEvents,
  checkMissingProperty,
  errorsPerSchema,
  nestedPropValidation,
  eventValidation,
  validationResult
)