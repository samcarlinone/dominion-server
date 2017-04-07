class Room {
  constructor() {
    this.users = [];
  }

  checkDisconnected() {
    var time = new Date().getTime();

    for(var i=0; i<this.users.length; i++) {
      if(time - this.users[i].lastTime > 3000) {
        this.broadcast({
          type: "disconnect",
          user: this.users[i].name
        });

        this.users[i].disconnected = true;
        this.users.splice(i, 1);
        i--;
      }
    }
  }

  addUser(user) {
    this.users.push(user);
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
