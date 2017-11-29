import request = require("request-promise-native");
export default function(url: string) {
  const json: boolean = true;
  const method: any = "GET";
  const clear = (): any => {
    const uri: string = `${url}/drop`;
    return request({uri, method, json});
  };
  return {
    clear,
  };
}
