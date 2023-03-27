import Ajv from 'ajv'
import { AggregateAjvError } from '@segment/ajv-human-errors'
import { isArray } from 'util'

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict:false
})

function takeKeysOfSchema(schema){
  
  for(let [key] of Object.entries(schema.properties))
  if(key !== 'event'){
    return key
  }
}

function takeKeysOfDataLayer(data){
  for(let [key] of Object.entries(data))
  if(key !== 'event'){
    return key
  }
}
let arr = []
function takeEventNameOfDataLayer(data){
for(let [key,value] of Object.entries(data)){
  if(key === 'event'){
    arr.push(value)
  }}
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        return true;
      }
    }
  }
  return false; // no duplicates found
}


function validation(schema, data) {
  for (let i = 0; i < schema.length; i++) {
    if (schema[i].properties.event.enum[0] === data.event) {
      if(takeEventNameOfDataLayer(data) === true){
        if(takeKeysOfSchema(schema[i]) === takeKeysOfDataLayer(data)){
            const valid = ajv.validate(schema[i], data)
            if (!valid){
              const errors = new AggregateAjvError(ajv.errors)
              let arr = []
              arr.push(errors)
              if(!!arr[0].message){
              console.log(`${arr[0].message} in the ${JSON.stringify(data,null,2)}`)
              }
              schema.split(i,1)
            }else{
              console.log(`correct in ${JSON.stringify(data,null,2)}`)
              schema.split(i,1)
            }      
         }
      }else{
        const valid = ajv.validate(schema[i], data)
        if (!valid){
          const errors = new AggregateAjvError(ajv.errors)
          let arr = []
          arr.push(errors)
          if(!!arr[0].message){
          console.log(`${arr[0].message} in the ${JSON.stringify(data,null,2)}`)
          }
          schema.split(i,1)
        }else{
          console.log(`correct in ${JSON.stringify(data,null,2)}`)
          schema.split(i,1)
        }  
      }
    }
  }
  return console.log(`The dataLayer event is not present in the schema ${JSON.stringify(data,null,2)}`)
}

export default(validation)

