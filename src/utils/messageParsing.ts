export function filterMentionsFromCommandArgs(args: string[]) {
  return args.filter(arg => {
    const regex = /<@\w+>/;
    return !regex.test(arg);
  });
}
