import time, {Time} from "../../tools/calculations/time";
import {Backend} from "./backend";

export default (backend: Backend, numberOfAttempts: number = 6, testing?: string): Promise<any> => {
  let amountOfTries: number = numberOfAttempts;
  const secondsBetweenTries: number = 1;
  const periodOfTime: Time = time();
  const errorMessage: string = "Could not initialize database, connection timed out.";
  const repeatedlyAttemptMigration = (): Promise<any> => backend.migrate(testing)
    .then(({response}): Promise<any> => Promise.resolve(response))
    .catch(() => {
      return amountOfTries-- ?
        periodOfTime.wait(periodOfTime.seconds(secondsBetweenTries)).then(repeatedlyAttemptMigration) :
        Promise.reject(errorMessage);
    });
  return repeatedlyAttemptMigration();
};
