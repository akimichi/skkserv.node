const mongoose = require('mongoose'),
  Dictionary = require('../models/Dictionary.js');


const DICTIONARY = {
  nurse: new Role({
    name: 'nurse',
  }),
  clerk:new Role({
    name: 'clerk',
  }),
  admin: new Role({
    name: 'admin',
  }),
  doctor: new Role({
    name: 'doctor',
  })
};

