import result from "../resultado/result.js"

function teste(){
    const schema = JSON.stringify(result())
    console.log(schema)
}
teste()
