const lipra = require('lipra');

if (typeof lipra.logger?.info !== 'function') {
  throw new Error('logger.info missing');
}
if (typeof lipra.Logger !== 'function') {
  throw new Error('Logger missing');
}
if (typeof lipra.createLogRecord !== 'function') {
  throw new Error('createLogRecord missing');
}

console.log('OK');
