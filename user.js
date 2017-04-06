class User {
  constructor(name) {
    this.name = name;
    this.lastTime = new Date().getTime();
    this.pendingMessages = [];
  }
}

module.exports = User;
