/* eslint-disable class-methods-use-this */
class CacheParser {
  constructor({ flagSize: flagSize = 32, keyLength = 250 } = {}) {
    this.flagSize = flagSize;
    this.keyLength = keyLength;
    this.validOperations = [
      'get',
      'set',
      'cas',
      'add',
      'replace',
      'append',
      'prepend',
    ];
  }

  /**
   * @todo Stop with the noodles.
   * parses the operation in standar form
   * {op: op,keys: key,flags: flags,ttl: ttl,size: size,data: data}
   * @param {[string]]} param0
   * @param {[string]} data
   *
   */
  parseOp(input) {
    const [command, data, ...rest] = input.trim().split('\r\n');
    const [op, ...commandParts] = command.split(' ');

    if (op === 'get') {
      return {
        keys: commandParts,
        op,
        data,
        rest,
      };
    }
    const [keys, flags, ttl, size, ...restCommandPart] = commandParts;
    return {
      op,
      keys,
      flags: parseInt(flags, 10),
      ttl: parseInt(ttl, 10),
      size: parseInt(size, 10),
      data,
      rest,
      cas: (op === 'cas' ? restCommandPart[0] : restCommandPart),
    };
  }

  /**
   *
   * @param {*} key
   * Keys
   * length limit of a key is set at 250 character
   * the key must not include control characters or whitespace.
   *
   */
  validKey(key) {
    return key.length > 0 && (key.length <= 250) && !/[^a-z0-9]/gi.test(key);
  }

  validFlag(flags) {
    return !Number.isNaN(flags);
  }

  validCas(op, cas) {
    let allValid;
    if (op === 'cas') {
      const validLimit = cas.endsWith(']') && cas.startsWith(']');
      allValid = validLimit;
    } else {
      allValid = cas === undefined;
    }
    return allValid;
  }

  /**
   * Number representing time to live TTL
   * @todo ttl must be greater or equal than 0
   * @param {Integer} value
   */
  validTtl(ttl) {
    return ttl >= 0;
  }

  /**
   * Data size must be equal than size parameter
   * @param {*} data
   * @param {String} sizeString
   */
  validData(dataNoReply, size) {
    let sizeValid = false;
    let noReply = '';
    let parsedData = '';
    let dataValid = false;
    if (dataNoReply !== undefined && size !== undefined) {
      sizeValid = !(Number.isNaN(size));
      noReply = dataNoReply.slice(-10) === ' [noreply]';
      parsedData = noReply ? dataNoReply.slice(0, dataNoReply.length - 10) : dataNoReply;
      dataValid = sizeValid && parsedData.length === size;
    }
    return { dataValid, parsedData, noReply };
  }

  /**
   * validation for cache "get" operation
   * @param {{string , [string]}} param0
   * @param {string} data {must be "" in the case of get}
   * @param {[string]} rest {empty list in the case of get}
   *
   */
  get({ op, keys, data, rest }) {
    const dataValid = data === undefined;
    const restValid = rest.length === 0;
    const opValid = op === 'get';
    const keysValid = keys.every(this.validKey);
    const allValid = opValid && dataValid && keysValid && restValid;
    return {
      op: 'get',
      keys,
      valid: allValid,
    };
  }

  /**
   * "set mykey 0 60 4\r\ndata\r\n"
   * "set" means "store this data".
   * @param {*} jsonOperation
   */
  validStorageOp({ op, keys, flags, ttl, size, data, cas }) {
    const opValid = op !== 'get' && this.validOperations.includes(op);
    const keysValid = Boolean(typeof keys === 'string' && this.validKey(keys));
    const flagsValid = this.validFlag(flags);
    const ttlValid = this.validTtl(ttl);
    const { dataValid, parsedData, noReply } = this.validData(data, size);
    const casValid = this.validCas(cas);
    const allValid = opValid && dataValid && keysValid && casValid && ttlValid && flagsValid;
    return {
      op,
      keys,
      flags,
      ttl,
      size,
      noReply,
      cas,
      data: parsedData,
      valid: allValid,
    };
  }

  set(parsedOp) {
    return this.validStorageOp(parsedOp);
  }


  /**
   * Checks if operation in validOperation.
   * @param {String} op string representing operation
   *
   */
  validOperation({ op }) {
    return this.validOperations.includes(op);
  }

  /**
   * Parses operation in in the form of {op , keys , valid , error}
   * @param {string} input
   * input must come in the form of
   * op mykey <flags> <ttl> <size> \r\n data \r\n
   */
  parseCommand(input) {
    const parsedOp = this.parseOp(input);
    if (this.validOperation(parsedOp)) {
      const res = this[parsedOp.op](parsedOp);
      return res;
    }
    return parsedOp;
  }

  /**
   *
   *"add" means "store this data, but only if the server *doesn't* already
   * hold data for this key".
   *
   * @param {flags, exptime,  bytes,  "[noreply]" ,"\r\n"} jsonOperation
   */
  add(parsedOp) {
    return this.validStorageOp(parsedOp);
  }

  /**
   * "replace" means "store this data, but only if the server *does* already hold data for this key".
   * @param {*} jsonOperation
   */
  replace(parsedOp) {
    return this.validStorageOp(parsedOp);
  }

  /**
   * "append" means "add this data to an existing key after existing data".
   * @param {*} jsonOperation
   */
  append(parsedOp) {
    return this.validStorageOp(parsedOp);
  }

  /**
   *   "prepend" means "add this data to an existing key before existing data".
   * @param {*} jsonOperation
   */
  prepend(parsedOp) {
    return this.validStorageOp(parsedOp);
  }


  /**
 * "cas" is a check and set operation which means "store this data but
 * only if no one else has updated since I last fetched it."
 * @param {*} parsedOp
 */
  cas(parsedOp) {
    return this.validStorageOp(parsedOp);
  }
}

exports.CacheParser = CacheParser;
