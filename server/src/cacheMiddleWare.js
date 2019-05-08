class CacheMiddleWare {
  /**
   *
   * @param {*} validator
   * @param {*} cache
   */
  constructor(validator, cache) {
    this.validator = validator;
    this.cache = cache;
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

  runOperation(input) {
    const operation = this.validator.parseCommand(input);
    if (operation.valid === true) {
      return this[operation.op](operation);
    }
    return 'CLIENT_ERROR invalid_Command\r\n';
  }

  get(operation) {
    const res = operation.keys.map(key => this.cache.cacheGet(key));
    return res.join(' \r\n ->');
  }

  /**
   * "set" means "store this data".
   * @param {*} jsonOperation
   */
  set(operation) {
    return operation.noReply ? '' : this.cache.cacheSet(operation);
  }

  /**
 * '"cas" is a check and set operation which means
 * "store this data but only if no one else has updated since I last fetched it."'
 * @param {*} operation
 */
  cas(operation) {
    return operation.noReply ? '' : this.cache.cacheCas(operation);
  }

  /**
   *
   *"add" means "store this data, but only if the server *doesn't* already
   * hold data for this key".
   *
   * @param {flags, exptime,  bytes,  "[noreply]" ,"\r\n"} jsonOperation
   */
  add(operation) {
    return operation.noReply ? null : this.cache.cacheAdd(operation);
  }

  /**
   * "replace" means "store this data, but only if the server *does* already hold data for this key".
   * @param {*} jsonOperation
   */
  replace(operation) {
    return operation.noReply ? null : this.cache.cacheReplace(operation);
  }

  /**
   * "append" means "add this data to an existing key after existing data".
   * @param {*} jsonOperation
   */
  append(operation) {
    return operation.noReply ? null : this.cache.cacheAppend(operation);
  }

  /**
   *   "prepend" means "add this data to an existing key before existing data".
   * @param {*} jsonOperation
   */
  prepend(operation) {
    return operation.noReply ? null : this.cache.cachePrepend(operation);
  }
}

exports.CacheMiddleWare = CacheMiddleWare;
