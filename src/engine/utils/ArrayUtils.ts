

export function spreadArrayRecusively(array:Array<any>): Array<number> {
  return spread(array);
}

function spread(array:Array<any>){
  let newArray = [];

  for(let i = 0; i < array.length; i++){
    if(array[i] instanceof Array) {
      newArray.push(...spread(array[i]));
    } else {
      newArray.push(array[i]);
    }
  }
  
  return newArray;
}