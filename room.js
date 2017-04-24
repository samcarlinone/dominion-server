class Room {
  constructor(name, host) {
    this.users = [];
    this.name = name;
    this.host = host;

    this.hasShutdown = false;
  }

  checkDisconnected() {
    var time = new Date().getTime();
    var hostLeft = false;

    for(var i=0; i<this.users.length; i++) {
      if(time - this.users[i].lastTime > 3000) {
        this.broadcast({
          type: "disconnect",
          user: this.users[i].name
        });

        if(this.users[i].name === this.host)
          hostLeft = true;

        this.users[i].disconnected = true;
        this.users.splice(i, 1);
        i--;
      }
    }

    if(hostLeft)
      this.shutdown();
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
    user.inRoom = true;
  }

  getUser(name) {
    for(var i=0; i<this.users.length; i++) {
      if(this.users[i].name == name) {
        return this.users[i];
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
