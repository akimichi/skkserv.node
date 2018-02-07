const CONFIG = (env) => {
  const uri = "13.113.201.103"; // AWS Light Sail のインスタンス
  const json = {
    "test": {
      "db": {
        "mongo": {
          "uri": `mongodb://${uri}:27117/skkserv-test`
        }
      }
    },
    "development": {
      "db": {
        "mongo": {
          "uri": `mongodb://${uri}:27117/skkserv-dev`
        }
      },
      "port": 1179
    },
    "production": {
      "db": {
        "mongo": {
          "uri": `mongodb://${uri}:27117/skkserv`
        }
      },
      "port": 1178
    }
  }
  if(json[env] === undefined) {
    throw new Error("ENV " + env + "is invalid");
  } else {
    return json[env];
  }
}

module.exports = CONFIG;
