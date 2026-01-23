const path = require('path');

const CONFIG = (env) => {
  // 環境に応じた.envファイルを読み込む
  const envFile = env === 'test' ? '.env.test'
                : env === 'production' ? '.env.production'
                : '.env';
  require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const json = {
    "test": {
      "db": {
        "mongo": {
          "uri": mongoUri
        }
      }
    },
    "development": {
      "db": {
        "mongo": {
          "uri": mongoUri
        }
      },
      "port": 1179
    },
    "production": {
      "db": {
        "mongo": {
          "uri": mongoUri
        }
      },
      "port": 1178
    }
  };

  if(json[env] === undefined) {
    throw new Error("ENV " + env + " is invalid");
  }
  return json[env];
};

module.exports = CONFIG;
