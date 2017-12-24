export default (function() {
  const sea: string[] = ["sea", "reef", "shoal"];
  const shoal: string[] = sea;
  const reef: string[] = sea;
  const bridge: string[] = ["bridge"];
  const pipe: string[] = ["pipe"];
  const river: string[] = ["river"];
  const road: string[] = ["road"];
  return {
    bridge,
    pipe,
    reef,
    river,
    road,
    sea,
    shoal,
  };
}());
