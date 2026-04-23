import net = require('net');
const pkg = require('../package.json');
import dictionary = require('./dictionary');

const Self = {
  skk: (connection: net.Socket) => {
    connection.on('data', async (data: Buffer) => {
      console.log('request: ' + data);
      const request = data.toString(),
        command = request.substr(0, 1);

      switch (command) {
        case '0':
          console.log(`connection closed!`);
          connection.write(`1/connection closed!/\n`);
          connection.destroy();
          break;
        case '1':
          const yomi = request.substr(1).trim();
          if (yomi.startsWith("(")) {
            const replaced = yomi.replace(new RegExp("_", 'g'), " ");
            try {
              const answer = await dictionary.runLisp(replaced);
              if (Array.isArray(answer)) {
                const candidates = answer.join("/");
                console.log(`response: ${candidates}`);
                connection.write(`1/${candidates}/\n`);
              } else {
                console.log(`response: ${answer}`);
                connection.write(`1/${answer}/\n`);
              }
            } catch (errMessage) {
              console.log(`err: ${errMessage}`);
              connection.write(`4${errMessage}`);
            }
          } else if(yomi.startsWith("=")){
            try {
              const arithExpr = yomi.substring(1);
              const answer = await dictionary.runArith(arithExpr);
              if (Array.isArray(answer)) {
                const candidates = answer.join("/");
                console.log(`response: ${candidates}`);
                connection.write(`1/${candidates}/\n`);
              } else {
                console.log(`response: ${answer}`);
                connection.write(`1/${answer}/\n`);
              }
            } catch (errMessage) {
              console.log(`err: ${errMessage}`);
              connection.write(`4${errMessage}`);
            }

          } else if(yomi.startsWith("@")){
            try {
              const dateExpr = yomi.substring(1);
              const answer = await dictionary.runDatetime(dateExpr);
              if (Array.isArray(answer)) {
                const candidates = answer.join("/");
                console.log(`response: ${candidates}`);
                connection.write(`1/${candidates}/\n`);
              } else {
                console.log(`response: ${answer}`);
                connection.write(`1/${answer}/\n`);
              }
            } catch (errMessage) {
              console.log(`err: ${errMessage}`);
              connection.write(`4${errMessage}`);
            }

          } else {

            try {
              const response = await dictionary.henkan(yomi);
              const candidates = response.join("/");
              console.log(`response: ${candidates}`);
              connection.write(`1/${candidates}/\n`);
            } catch (err) {
              connection.write(err as string);
            }
          }
          break;
        case '2':
          const response = `${pkg.version} `
          console.log(`response: ${response}`);
          connection.write(response);
          break;
        default:
          connection.write(`4${command}`);
      }
    });
    connection.on('end', () => {
      console.log('connection closed.');
    });
    connection.on('error', (err: Error) => {
      console.log('ERROR: ' + err.stack);
    });
  },
  echo: (connection: net.Socket) => {
    connection.on('data', (data: Buffer) => {
      const request = data.toString();
      connection.write(request);
    });
    connection.on('end', () => {
      console.log('connection closed.');
    });
    connection.on('error', (err: Error) => {
      console.log('ERROR: ' + err.stack);
    });
  }
};

export = Self;
