export default function(object: any, name: string): any {

  Object.defineProperty(object, "name", {value: name});

  return object;
}
