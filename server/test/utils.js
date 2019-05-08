const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

const validOperations = [
  'get',
  'set',
  'cas',
  'add',
  'replace',
  'append',
  'prepend',
];

exports.getRandomInt = (minn, maxx) => {
  const min = Math.ceil(minn);
  const max = Math.floor(maxx);
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.randomString = () => crypto.randomBytes(20).toString('hex');

exports.getValid = (keys) => {
  const op = 'get';
  const strCommand = `${op} ${keys.join(' ')}\r\n`;
  const valid = true;
  return {
    keys, op, valid, strCommand,
  };
};

exports.randomGetValid = () => {
  // return { keys: commandParts,op,data,rest,};
  const keys = [...Array(this.getRandomInt(1, 4))].map(() => crypto.randomBytes(20).toString('hex'));
  return this.getValid(keys);
};

exports.randomKey = size => crypto.randomBytes(this.getRandomInt(1, size)).toString('hex');

exports.randomSetValid = () => this.randomStorageValid('set');

exports.randomStorageValid = (op) => {
  //   set({ op, keys, flags, ttl, size, data }, rest)

  const keys = this.randomKey(10);
  const flags = this.getRandomInt(0, 10);
  const ttl = this.getRandomInt(0, 60 * 60 * 24 * 30);
  const data = this.randomKey(10);
  const size = data.length;
  const noReply = this.getRandomInt(0, 1) === 1;
  const noReplyStr = noReply ? ' [noreply]' : '';
  const strCommand = `${op} ${keys} ${flags} ${ttl} ${size}${noReplyStr}\r\n${data}\r\n`;

  const valid = true;
  return {
    data, flags, keys, noReply, op, size, ttl, valid, strCommand,
  };
};

exports.randomValidOp = () => {
  const randomOp = validOperations[Math.floor(Math.random() * validOperations.length)];
  let op;
  switch (randomOp) {
    case 'cas':
      op = this.randomCasValid();
      break;
    case 'get':
      op = this.randomGetValid();
      break;
    default:
      op = this.randomStorageValid(randomOp);
      break;
  }
  return op;
};

exports.randomCasValid = (keys = crypto.randomBytes(this.getRandomInt(1, 125)).toString('hex'), cas = uuidv4()) => {
  //   set({ op, keys, flags, ttl, size, data }, rest)

  const flags = this.getRandomInt(0, 10);
  const ttl = this.getRandomInt(0, 60 * 60 * 24 * 30);
  const data = this.randomKey(10);
  const size = data.length;
  const noReply = this.getRandomInt(0, 1) === 1;
  const noReplyStr = noReply ? ' [noreply]' : '';
  const op = 'cas';
  const strCommand = `${op} ${keys} ${flags} ${ttl} ${size} ${cas}${noReplyStr}\r\n${data}\r\n`;
  const valid = true;
  return {
    data, flags, keys, noReply, op, size, ttl, valid, cas, strCommand,
  };
};
