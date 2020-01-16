const message = require('./message');

const noDups = str => str.length === new Set(str.split('')).size;

const findSignal = str => {
   for (let i = 0; i < str.length - 16; i++) {
     const sub = str.slice(i, i + 16);
     if (noDups(sub)) console.log(`${sub} -> ${Buffer.from(sub, 'base64')}`);
   }
}

findSignal(message);
/*
  console output:
  Q3VydGlzaXNsYW5k -> Curtisisland
*/
