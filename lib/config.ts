interface Config {
  port: number;
}

interface ConfigMap {
  [key: string]: Config;
}

const CONFIG = (env: string): Config => {
  const json: ConfigMap = {
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

export = CONFIG;
