import time, {Time} from "../../tools/calculations/time";
import {Backend} from "./backend";
export default (backend: Backend): Promise<any> => {
  const secondsToCompleteMigration: number = 5;
  const periodOfTime: Time = time();
  const errorMessage: string = "Could not initialize database, connection timed out.";
  const secondsTillTimeout: number = periodOfTime.seconds(secondsToCompleteMigration);
  const repeatedlyAttemptMigration = (): Promise<any> => backend.migrate()
    .then(({response}): Promise<any> => Promise.resolve(response))
    .catch(() => repeatedlyAttemptMigration());
  return Promise.race([
    repeatedlyAttemptMigration(),
    periodOfTime.wait(secondsTillTimeout)
      .then(() => Promise.reject(Error(errorMessage))),
  ]);
};
