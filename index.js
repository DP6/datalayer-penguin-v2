import Ajv from 'ajv'
import { AggregateAjvError } from '@segment/ajv-human-errors'


const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict:false
})

function takeKeysOfSchema(schema){ // Function responsible for retrieving the sub-property of the event if there is more than one event with the same name in the schema.
  
  for(let [key] of Object.entries(schema.properties))
  if(key !== 'event'){
    return key
  }
}

function takeKeysOfDataLayer(data){ // Function responsible for retrieving the sub-property of the event if there is more than one event with the same name in the dataLayer.
  for(let [key] of Object.entries(data))
  if(key !== 'event'){
    return key
  }
}
let arr = []
function takeEventNameOfDataLayer(data){ //Function responsible for checking if there is more than one event with the same name in dataLayer.
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


function validation(schema, data) { // validation function
  for (let i = 0; i < schema.length; i++) { // check schema size
    if (schema[i].properties.event.enum[0] === data.event) { // checks if event name in schema is the same in dataLayer
      if(takeEventNameOfDataLayer(data) === true){ // checks if the event name is repeated in the dataLayer
        if(takeKeysOfSchema(schema[i]) === takeKeysOfDataLayer(data)){ // if the name is repeated it takes the corresponding event in the schema and does the validation process
            const valid = ajv.validate(schema[i], data) // ajv validation
            if (!valid){ // if ajv catches an error
              const errors = new AggregateAjvError(ajv.errors) // makes the error message more human
              let arr = []
              arr.push(errors)
              if(!!arr[0].message){
              console.log(`${arr[0].message} in the ${JSON.stringify(data,null,2)}`) // error mesage
              }
              schema.split(i,1) // deletes the validated event from the schema 
            }else{
              console.log(`correct in ${JSON.stringify(data,null,2)}`)  // if the dataLayer is correct
              schema.split(i,1) // deletes the validated event from the schema
            }      
         }
      }else{ // if there is no event with the same name in the dataLayer
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
  return console.log(`The dataLayer event is not present in the schema ${JSON.stringify(data,null,2)}`) //if the dataLayer event is not in the schema

}

export default(validation)