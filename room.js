class Room {
  constructor(name, host) {
    this.users = [];
    this.name = name;
    this.host = host;

    this.hasShutdown = false;
    this.hostLeft = false;
  }

  checkDisconnected() {
    var time = new Date().getTime();

    for(var i=0; i<this.users.length; i++) {
      if(time - this.users[i].lastTime > 3000) {
        this.users[i].disconnected = true;
        this.disconnectUser(i);
        i--;
      }
    }

    if(this.hostLeft)
      this.shutdown();
  }

  disconnectUser(index) {
    if(index.name !== undefined)
      index = this.getUserIndex(index.name);

    this.broadcast({
      type: "disconnect",
      user: this.users[index].name
    });

    if(this.users[index].name === this.host)
      this.hostLeft = true;

    this.users[index].pendingMessages = [];
    this.users[index].inRoom = false;

    this.users.splice(index, 1);
  }

  shutdown() {
    this.hasShutdown = true;

    for(var i=0; i<this.users.length; i++) {
      this.users[i].pendingMessages = [];
      this.users[i].roomShutdown = true;
      this.users[i].inRoom = false;
    }

    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
    user.inRoom = this;
  }

  getUser(name) {
    for(var i=0; i<this.users.length; i++) {
      if(this.users[i].name === name) {
        return this.users[i];
      }
    }
  }

  getUserIndex(name) {
    for(var i=0; i<this.users.length; i++) {
      if(this.users[i].name === name) {
        return i;
      }
    }
  }

  broadcast(msg) {
    for(var i=0; i<this.users.length; i++) {
      this.users[i].pendingMessages.push(msg);
    }
  }
}

module.exports = Room;
