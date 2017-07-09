'use strict';

const mongoose = require('mongoose'),
  Entry = require("../models/entry");

const ENTRY = {
  tatsukawa: new Entry({
    yomi: 'たつかわ',
    candidates: ["立川", "達川"]
  })
};

module.exports.entries = () => {
  return ENTRY; 
};
