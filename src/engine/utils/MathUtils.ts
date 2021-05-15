
export function roundTo(val:number, decimalPlaces:number){
  let percision = Math.pow(10,decimalPlaces);
  return Math.round(val * percision) /  percision;
}

export function clamp(val:number, min:number, max:number){
  return Math.min( Math.max(val,min), max );
}