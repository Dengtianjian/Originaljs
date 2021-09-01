import Element from "./Element";
import Utils from "./Utils";

// const obj = {
//   count: {
//     news: {
//       __els: [14, 15, 16]
//     },
//     __methods: [
//       1, 2, 3
//     ],
//     __attrs: [
//       4, 5, 6
//     ]
//   }
// };
// Utils.objectMerge(obj, {
//   count: {
//     __els: [
//       7, 8, 9
//     ]
//   },
//   name: {
//     __methods: [
//       11, 12, 13
//     ]
//   }
// })
// console.log(obj);


export default {
  createElement: Element.createElement,
  defineElement: Element.defineElement
}