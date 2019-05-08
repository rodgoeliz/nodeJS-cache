const { createServer } = require('net');

class Server {
  constructor({
    port: port = 11211,
    address,
    cacheMiddleWare,
  }) {
    this.port = port;
    this.address = address;
    this.cacheMiddleWare = cacheMiddleWare;
    this.init();
  }

  init() {
    // eslint-disable-next-line no-console
    console.log(`Master 🧘 ${process.pid} ${this.address}:${this.port} is running`);
    const cache = this.cacheMiddleWare;
    createServer((socket) => {
      socket.setTimeout(1000);
      socket.setMaxListeners(1000);
      socket.setEncoding('utf-8');
      socket.on('data', (buf) => {
        const opRes = cache.runOperation(buf.toString());
        if (opRes !== null) {
          socket.write(`${opRes}`);
        }
      });
    })
      .on('error', (err) => {
        throw err;
      })
      .listen(this.port, this.address);
  }
}

exports.Server = Server;
