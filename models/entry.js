// models/entry.js

const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

// const CandicateSchema   = new Schema({
//   word: { type: String, required: false},
//   createdOn: {type: Date, default: Date.now, required: true}
// });

const EntrySchema   = new Schema({
  yomi: {type: String, unique: true, required: true},
  candidates: Array  
  // SubDocument: Koho
  // candidates: [
  //   CandicateSchema
  // ]
  createdOn: {type: Date, default: Date.now, required: true},
});


module.exports = mongoose.model('Entry', EntrySchema);

