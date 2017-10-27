// import notifications, {PubSub} from "../pubSub";
// import typeChecker, {TypeChecker} from "../validation/typeChecker";
//
// export default (function() {
//
//   const {publish}: PubSub = notifications();
//   const {isString}: TypeChecker = typeChecker();
//
//   return function(url: string): void {
//
//     if (isString(url)) {
//
//       window.top.location.href = url;
//
//     } else {
//
//       publish("invalidInput", {className: "redirect", method: "redirectTo", input: url});
//     }
//   };
// }());
