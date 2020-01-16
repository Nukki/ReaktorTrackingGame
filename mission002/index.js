const fs = require('fs');

// calculates the upper boundary for 3 standard deviations away from mean
const upperBoundary = array => {
   const n = array.length;
   const arraySum = array.reduce((acc, curr) => acc + curr, 0);
   const mean = ~~(arraySum / n);
   const sumSquares = array.reduce((acc, curr) => acc + (curr - mean) ** 2, 0);
   const standardDeviation = ~~(Math.sqrt(sumSquares / (n - 1)))
   return mean + (standardDeviation * 3);
}

const findDangerousAnomaly = fileName => {
  // transform binary file to JSON
  const buffer = fs.readFileSync(`${__dirname}/${fileName}`);
  const json = buffer.toString()
               .split(' ')
               .reduce((acc, curr) => acc + String.fromCharCode(`0b${curr}`), '');

  let arr = JSON.parse(json);
  let readingsMap = {};
  let hourlyTotals = {};
  /*
    we need to map the total of contaminants to date and time.
    The "readingsMap" object will have 24 * 31 props, with every hourly total.
    Each entry represents the total of contaminants.
    {
       '20_22': 12034,
       '20_23': 21443,
       ...
       i.e. day_time: sumOfcontaminantsForHour
    }
    day in our case is the index of the element in arr

    The "hourlyTotals" object will have 24 props.
    It maps groups every hour to an array of length 31,
    Each entry represents an hour of a day.
    {
      '5': [1394, 1224, 2424, 3545, ...],
      '6': [1494, 1644, 2434, 3545, ...],
      ...
      i.e time: [totalOnDec1, totalOnDec2, totalOnDec3, ...]
    }
  */
  arr.forEach((entry, day) => {
    const { readings } = entry;
    readings.forEach(read => {
      const { contaminants, time } = read;
      let sumForHour = 0; // total of contaminants for that time
      for (let con in contaminants) {
        sumForHour += contaminants[con];
      }
      readingsMap[`${day}_${time}`] = sumForHour;
      if(!hourlyTotals[time]) {
        hourlyTotals[time] = [sumForHour];
      } else {
        hourlyTotals[time].push(sumForHour);
      }
    })
  })

  // look for deviation in one of the hours
  for (let hour in hourlyTotals) {
    let normal = upperBoundary(hourlyTotals[hour]);
    for (let key in readingsMap) {
      if (key.includes(`_${hour}`)) {
        if (readingsMap[key] > normal) {
          let metadata = key.split('_');
          const { id } = arr[metadata[0]].readings[metadata[1]];
          console.log(`${readingsMap[key]} is an anomaly on Dec ${+metadata[0] + 1} at ${metadata[1]} o'clock`)
          console.log(`id: ${id} -> ${Buffer.from(id, 'hex')}`);
        }
      }
    }
  }
}

findDangerousAnomaly('ppb.bin.log');
/*
  console output:
  1249458 is an anomaly, on Dec 25 at 5 o'clock
  id: 4B554E47524144 -> KUNGRAD
*/
