const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // read the variables from the config.env
const app = require('./app');

// see your dev variables
// console.log(app.get('env'));

console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
