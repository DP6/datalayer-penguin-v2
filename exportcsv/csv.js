import dataLayer from '../dataLayer.json' assert {type: 'json'}


let dt = (obj, arr = []) => {
  return Object.keys(obj).reduce((result, index) => {
    if (typeof obj[index] !== "object") {
      result[arr.concat(index).join("_")] = obj[index];
      return result;
    }
    return Object.assign(result, dt(obj[index], arr.concat(index), result));
  }, {});
}


let data = []
data.push(dt(dataLayer))
//console.log(data)
export default data