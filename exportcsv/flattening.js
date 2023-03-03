const data = 
[
  {
    dataLayer: 'dataLayer',
    objectName: 'objectName',
    keyName: 'keyName',
    status: 'status',
    message: 'message',
    partialErrors: { ocurrences: 0, trace: '' }
  }
]

let dt = (obj, arr = []) => {
  return Object.keys(obj).reduce((result, index) => {
    if (typeof obj[index] !== "object") {
      result[arr.concat(index).join("_")] = obj[index];
      return result;
    }
    return Object.assign(result, dt(obj[index], arr.concat(index), result));
  }, {});
}


let dat = []
dat.push(dt(data[0]))
//console.log(dat)
export default dat