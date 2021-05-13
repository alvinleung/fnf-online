
export function roundTo(val:number, decimalPlaces:number){
  let percision = Math.pow(10,decimalPlaces);
  return Math.round(val * percision) /  percision;
}