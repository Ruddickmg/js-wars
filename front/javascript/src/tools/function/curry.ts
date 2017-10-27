export default (input: (...args: any[]) => any, context: any = this): any => {

  const totalNumberOfArguments: number = input.length;

  const currier = (...initialArguments: any[]): any => {

    const currentArguments: any[] = initialArguments.slice();
    const allArgumentsEntered: boolean = currentArguments.length >= totalNumberOfArguments;
    const acceptMoreArguments = (...moreArguments: any[]) => {

      const addedArguments = moreArguments.slice();

      return currier.apply(context, currentArguments.concat(addedArguments));
    };

    return allArgumentsEntered ? input.apply(context, currentArguments) : acceptMoreArguments;
  };

  return currier;
};
