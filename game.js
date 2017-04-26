const User = require('./user.js');
const Room = require('./room.js');

class Game {
  constructor() {
    this.rooms = [];
    this.users = [];

    this.interval = setInterval(() => { this.removeDisconnected(); }, 3500);
  }

  removeDisconnected() {
    for(var i=0; i<this.rooms.length; i++) {
      if(this.rooms[i].hasShutdown) {
        this.rooms.splice(i, 1);
        i--;
      }

      this.rooms[i].checkDisconnected();

      if(this.rooms[i].users.length === 0) {
        this.rooms.splice(i, 1);
        i--;
      }
    }

    var time = new Date().getTime();

    for(var i=0; i<this.users.length; i++) {
      if(this.users[i].disconnected || (!this.users[i].inRoom && (time-this.users[i].lastTime > 3000))) {
        //Testing
        this.broadcastAll({type: "message", name: "SYS", msg: "User: "+this.users[i].name+" left"});
        //End Testing
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

      case "create":
        var room = new Room(data.room_name, data.name);
        var user = this.getUser(data.name);

        if(user === undefined) {
          this.respond({type:"disconnected"}, response);
          break;
        }

        room.addUser(user);
        this.rooms.push(room);

        this.respond({type:"accepted"}, response);
        break;

      case "join":
        var user = this.getUser(data.name);

        if(user === undefined) {
          this.respond({type:"disconnected"}, response);
          break;
        }

        var room = this.getRoom(data.room_name, data.room_host);

        if(room === undefined || room.users.length === 4) {
          this.respond({type: "rejected"}, response);
          break;
        }

        room.addUser(user);
        this.respond({type: "accepted"}, response);
        break;

      case "leave":
        var user = this.getUser(data.name);

        if(user === undefined) {
          this.respond({type:"disconnected"}, response);
          break;
        }

        if(user.inRoom !== false) {
          user.inRoom.disconnectUser(user);
          this.respond({type:"accepted"}, response);
          break;
        }

        this.respond({type:"rejected"}, response);
        break;

      case "ping":
        var user = this.getUser(data.name);

        if(user === undefined) {
          this.respond({type:"disconnected"}, response);
        } else {
          user.lastTime = new Date().getTime();

          if(user.inRoom) {
            this.respond(user.pendingMessages, response);
            user.pendingMessages = [];
          } else {
            if(user.roomShutdown) {
              this.respond({type:"room_shutdown"}, response);
              user.roomShutdown = false;
            } else {
              var room_list = "";

              if(this.rooms.length > 0) {
                for(var i=0; i<this.rooms.length; i++) {
                  room_list += `${this.rooms[i].name} ${this.rooms[i].host} (${this.rooms[i].users.length}/4),`;
                }
              }

              this.respond({type:"room_list", room_list:room_list}, response);
            }
          }
        }
        break;

      case "broadcast":
        this.broadcastAll({type: "message", name: data.name, msg: data.msg});
        this.respond({type:"confirm"}, response);
        break;

      default:
        this.respond({type:"error"}, response);
    }
  }

  broadcastAll(msg) {
    for(var i=0; i<this.users.length; i++) {
      this.users[i].pendingMessages.push(msg);
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

  getRoom(name, host) {
    if(this.rooms.length) {
      for(var i=0; i<this.rooms.length; i++) {
        if(this.rooms[i].name == name && this.rooms[i].host === host) {
          return this.rooms[i];
        }
      }
    }

    return undefined;
  }
}

module.exports = new Game();
