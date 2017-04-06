const User = require('./user.js');

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

class Chat {
  constructor() {
    this.rooms = [new Room()];
    this.users = [];
  }

  process(data, response) {
    switch(data.type) {
      case "connect":
        if(this.validateName(data.name)) {
          this.respond({type:"name_val", result:"valid"}, response);
        } else {
          this.respond({type:"name_val", result:"invalid"}, response);
        }

        break;
    }
  }

  respond(msg, response) {
    response.end(JSON.stringify(msg));
  }

  validateName(name) {
    for(var r=0; r<this.rooms.length; r++) {
      if(this.rooms[r].users.length) {
        for(var i=0; i<this.rooms[r].users.length; i++) {
          if(this.rooms[r].users[i].name === name)
            return false;
        }
      }
    }

    return true;
  }
}

module.exports = new Chat();
