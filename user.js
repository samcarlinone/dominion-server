class User {
  constructor(name) {
    this.name = name;
    this.lastTime = new Date().getTime();
    this.pendingMessages = [];
    this.disconnected = false;
    this.inRoom = false;
    this.roomShutdown = false;
  }
}

module.exports = User;
