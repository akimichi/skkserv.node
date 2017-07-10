'use strict';
// models/entry.js

const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

const EntrySchema   = new Schema({
  yomi: {type: String, unique: true, required: true},
  candidates: Array,
  createdOn: {type: Date, default: Date.now, required: true}
});

EntrySchema.statics.henkan = function (yomi, callback) {
  this.findOne({ 'yomi': yomi }, function (err, entry) {
    if (err) {
      callback(err);
    } else if (entry) {
      const candidates = entry.candidates.join("/");
      callback(null, `1/${candidates}/\n`);
    } else {
      callback(null, `4${yomi} `);
    }
  });
}

module.exports = mongoose.model('Entry', EntrySchema);

