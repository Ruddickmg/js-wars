import io = require("socket.io-client");
import connections from "../../../server/connections/connections";
import single from "../../../tools/storage/singleton";
interface ConnectionVars {
  IP?: string;
  PORT?: string | number;
}
export default single<any>((connectionVariables: ConnectionVars = {}): any => {
  const url: string = connections(connectionVariables).frontend().url;
  return io.connect(url);
});
