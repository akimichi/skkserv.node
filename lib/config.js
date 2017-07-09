const CONFIG = (env) => {
  const json = {
    "test": {
      "db": {
        "mongo": {
          "uri": "mongodb://localhost:27017/skkserv-test"
        }
      }
    },
    "development": {
      "db": {
        "mongo": {
          "uri": "mongodb://localhost:27017/skkserv-dev"
        }
      }
    }
  }
  if(json[env] === undefined) {
    throw new Error("ENV " + env + "is invalid");
  } else {
    return json[env];
  }
}

module.exports = CONFIG;
