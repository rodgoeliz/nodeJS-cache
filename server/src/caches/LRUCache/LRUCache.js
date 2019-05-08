/* eslint-disable linebreak-style */

class Node {
  constructor(key, value) {
    this.key = key;
    this.val = value;
    this.newer = null;
    this.older = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.defTtl = 10000;
    this.map = new Map();
    this.ttl = new Map();
    this.head = null;
    this.tail = null;
  }

  _clean() {
    this.ttl.forEach(({ value }) => (clearTimeout(value)));
    this.ttl.clear();
    this.map.clear();
    this.head = null;
    this.tail = null;
  }

  get(key) {
    if (this.map.has(key)) {
      this.updateKey(key);
      return this.map.get(key).val;
    }
    return undefined;
  }

  has(key) {
    return this.map.has(key);
  }

  updateKey(key) {
    const node = this.map.get(key);
    if (node.newer) {
      node.newer.older = node.older;
    } else {
      this.head = node.older;
    }
    if (node.older) {
      node.older.newer = node.newer;
    } else {
      this.tail = node.newer;
    }
    node.older = this.head;
    node.newer = null;
    if (this.head) {
      this.head.newer = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  getTtl(key, ttl = this.defTtl) {
    const ttlExists = this.ttl.get(key);
    if (ttlExists !== false) { clearTimeout(ttlExists); }
    this.ttl.set(key, setTimeout(() => { this.delete(key); }, ttl));
  }

  delete(key) {
    clearTimeout(this.ttl.get(key));
    return this.ttl.delete(key) && this.map.delete(key);
  }

  set(key, value) {
    const node = new Node(key, value);
    this.getTtl(key, value.ttl);
    if (this.map.has(key)) {
      this.map.get(key).val = value;
      this.updateKey(key);
      return;
    }
    if (this.map.size >= this.capacity) {
      const dKey = this.tail.key;
      this.tail = this.tail.newer;
      if (this.tail) {
        this.tail.older = null;
      }
      this.map.delete(dKey);
    }
    // insert node into the head
    node.older = this.head;
    if (this.head) {
      this.head.newer = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.map.set(key, node);
  }
}
exports.LRUCache = LRUCache;
