const User = require('./user.js');
const Room = require('./room.js');

class Game {
  constructor() {
    this.rooms = [new Room()];
    this.users = [];

    this.interval = setInterval(() => { this.removeDisconnected(); }, 3500);
  }

  removeDisconnected() {
    for(var i=0; i<this.rooms.length; i++) {
      this.rooms[i].checkDisconnected();
    }

    var time = new Date().getTime();

    for(var i=0; i<this.users.length; i++) {
      if(this.users[i].disconnected || (!this.users[i].inRoom && (time-this.users[i].lastTime > 3000))) {
        this.users.splice(i, 1);
        i--;
      }
    }
  }

  process(data, response) {
    switch(data.type) {
      case "connect":
        if(this.getUser(data.name) === undefined) {
          this.respond({type:"name_result", result:"valid"}, response);
          this.users.push(new User(data.name));
        } else {
          this.respond({type:"name_result", result:"invalid"}, response);
        }

        break;

      case "ping":
        var user = this.getUser(data.name);

        if(user === undefined) {
          this.respond({type:"disconnected"}, response);
        } else {
          this.respond(user.pendingMessages, response);
          user.pendingMessages = [];
          user.lastTime = new Date().getTime();
        }
        break;

      default:
        this.respond({type:"error"}, response);
    }
  }

  respond(msg, response) {
    response.end(JSON.stringify(msg));
  }

  getUser(name) {
    if(this.users.length) {
      for(var i=0; i<this.users.length; i++) {
        if(this.users[i].name === name)
          return this.users[i];
      }
    }

    return undefined;
  }
}

module.exports = new Game();
