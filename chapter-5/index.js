const fs = require('fs');
const superagent = require('superagent');
const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find that file');
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject('Could not write file');
      resolve('success');
    });
  });
};

// using async/await with promises
// basically,  await listens for the result of the promise and if successful then it completes the try statement, otherwise it goes to the catch block
const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dogg.txt`);
    console.log(`Breed: ${data}`);

    const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    console.log(res.body.message);

    await writeFilePro('dog-img.txt', res.body.message);
    console.log('Random dog image saved to file!');
  } catch (err) {
    console.log(err.message);
    // the throw error is necessary to to make the function to stop in case an error is found when retrieving the data
    throw err;
  }
  return '2: READY';
};

console.log('1: Will get dog pics!');
getDogPic()
  .then(x => {
    console.log(x);
    console.log('3: Done getting dog pics!');
  })
  .catch(err => {
    console.log('Error');
  });

// using promises
/*
readFilePro(`${__dirname}/dog.txt`)
  .then(data => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })

  .then(res => {
    console.log(res.body.message);
    return writeFilePro('dog-img.txt', res.body.message);

    //fs.writeFile('dog-img.txt', res.body.message, err => {
    //  if (err) return console.log(err.message);
    //  console.log('Random dog image saved to file!');
    //});
  })
  .then(() => {
    console.log('Random dog image saved to file!');
  })
  .catch(err => {
    console.log(err.message);
  });
*/

fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  // console.log(`Breed: ${data}`);
  // example of callback hell
  /*
  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`).end((err, res) => {
    if (err) return console.log(err.message);
    console.log(res.body.message);

    fs.writeFile('dog-img.txt', res.body.message, err => {
      if (err) return console.log(err.message);
      console.log('Random dog image saved to file!');
    });
  });*/
  /*
  console.log(`Breed: ${data}`);
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then(res => {
      if (err) return console.log(err.message);
      console.log(res.body.message);

      fs.writeFile('dog-img.txt', res.body.message, err => {
        if (err) return console.log(err.message);
        console.log('Random dog image saved to file!');
      });
    })
    .catch(err => {
      console.log(err.message);
    });
    */
});
