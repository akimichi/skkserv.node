'use strict';

const CONFIG = (env) => {
  const json = {
    "test": {
      "port": 1179
    },
    "development": {
      "port": 1179
    },
    "production": {
      "port": 1178
    }
  };

  if (json[env] === undefined) {
    throw new Error("ENV " + env + " is invalid");
  }
  return json[env];
};

module.exports = CONFIG;
