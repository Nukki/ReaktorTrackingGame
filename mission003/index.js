const fs = require('fs');

/*
  returns an array of flood danger volumes of given array
*/
const floodsOnPositiveSlope = arr => {
  let floods = []; // array of flood danger intervals
  let maxVal = arr[0];
  let maxInd = 0;
  let floodStart = false;
  for (let i = 1; i < arr.length; i++) {
    if (maxVal > arr[i]) { // readings decrease -> we passed the peak
      floodStart = true;   // flood danger is ON
    }
    if (maxVal <= arr[i] && !floodStart) { // going up to the peak with no flood danger
      maxVal = arr[i];
      maxInd = i;
    }
    if (maxVal <= arr[i] && floodStart) { // flood danger, new peak detected
       floods.push(arr.slice(maxInd, i));
       maxVal = arr[i];
       maxInd = i;
       floodStart = false;
    }
  }

  // calculate flood danger volume for each interval
  return floods.map(flood => {
     let startFlood = flood[0];
     return flood.reduce((acc, curr) => acc + (startFlood - curr) , 0);
  });
}


const getFloods = arr => {
  let iMax = arr.indexOf(Math.max(...arr)); // index of the highest point
  let beforeMax = arr.slice(0,iMax + 1);    // ascending part
  let afterMax = arr.slice(iMax).reverse(); // descending part mirror
  let floods = [...floodsOnPositiveSlope(beforeMax), ...floodsOnPositiveSlope(afterMax)]
  return floods.reduce((acc, curr) => acc + curr, 0);
}

const findAnomalies = fileName => {
  const data = fs.readFileSync(`${__dirname}/${fileName}`);
  const { regions } = JSON.parse(data);
  regions.forEach(reg => {
    const { readings } = reg;
    readings.forEach((entry, i) => {
      if (i > 0) {
        const { reading, readingID, date } = entry;
        let previous = getFloods(readings[i - 1].reading)
        let current = getFloods(reading);
        if (current - previous > 1000) console.log(`date: ${date} readingID: ${readingID}`);
      }
    })
  });
}

findAnomalies('flood.txt');
/*
  console output:
  date: 6-Dec-2018 readingID: F
  date: 5-Dec-2018 readingID: E
  date: 18-Dec-2018 readingID: R
  date: 9-Dec-2018 readingID: I
  date: 13-Dec-2018 readingID: M
  date: 5-Dec-2018 readingID: E
  date: 4-Dec-2018 readingID: D
*/

// Ferimed Pharmaceutical.
