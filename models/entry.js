'use strict';
// models/entry.js

const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

// const CandicateSchema   = new Schema({
//   word: { type: String, required: false},
//   createdOn: {type: Date, default: Date.now, required: true}
// });

const EntrySchema   = new Schema({
  yomi: {type: String, unique: true, required: true},
  candidates: Array,
  // SubDocument: Koho
  // candidates: [
  //   CandicateSchema
  // ]
  createdOn: {type: Date, default: Date.now, required: true}
});

EntrySchema.statics.henkan = function (yomi, callback) {
  // this.findOne({ 'yomi': yomi }, 'yomi candidates', function (err, entry) {
  this.findOne({ 'yomi': yomi }, function (err, entry) {
    if (err) {
      callback(err);
    } else if (entry) {
      console.log(`entry: ${entry}`);
      const candidates = entry.candidates.join("/");
      const response = `1/${candidates}/\n`;
      callback(null, response);
    } else {
      callback(null, `4${yomi} `);
    }
  });
}

module.exports = mongoose.model('Entry', EntrySchema);

