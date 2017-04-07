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
        if(this.validateName(data.name)) {
          this.respond({type:"name_result", result:"valid"}, response);
          this.users.push(new User(data.name));
        } else {
          this.respond({type:"name_result", result:"invalid"}, response);
        }

        break;
    }
  }

  respond(msg, response) {
    response.end(JSON.stringify(msg));
  }

  validateName(name) {
    if(this.users.length) {
      for(var i=0; i<this.users.length; i++) {
        if(this.users[i].name === name)
          return false;
      }
    }

    return true;
  }
}

module.exports = new Game();
