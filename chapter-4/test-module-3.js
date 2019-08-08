console.log('Hello from the module');

module.exports = () =>
  console.log('The module was already cached because the Hello from the module was printed only 1 time.');
