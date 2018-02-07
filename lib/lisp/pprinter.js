"use strict";

var expect = require('expect.js');
var Data = require('./data.js');
var List = require('./list.js');
const exp = require('./exp.js');

// const print = (data) => {
//   return Data.type(data,{
//     pair: () => {
//       return data.match({
//         empty: () => {
//           return "()";
//         },
//         cons: (l, r) => {
//           var left = print(l);
//           var right = print(r);
//           return "(" + left + "," + right + ")";
//         }
//       });
//     },
//     list: () => {
//       return data.match({
//         empty: () => {
//           return "[]";
//         },
//         cons: (head, tail) => {
//           return "[" + List.foldr(data)("nil")((item) => {
//             return (accumulator) => {
//               return  print(item) + "," + accumulator; 
//             };
//           }) + "]";
//         }
//       });
//     },
//     // exp: (value) => {
//     //   return value;
//     // },
//     number: (data) => {
//       return data;
//     },
//     string: (data) => {
//       return data;
//     },
//     boolean: (data) => {
//       return data;
//     },
//     symbol: (data) => {
//       return data.toString();
//     }
//   });
// };

// module.exports = {
//   print: print
// };
