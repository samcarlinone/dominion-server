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
        this.users.splice(i, 1);
        i--;
      }
    }
  }

  process(data, response) {
    var user = this.getUser(data.name);

    if(user === undefined) {
      if(data.type === "connect") {
        this.respond({type:"name_result", result:"valid"}, response);
        this.users.push(new User(data.name));
        return;
      } else {
        this.respond({type:"disconnected"}, response);
        return;
      }
    }

    switch(data.type) {
      case "connect":
        this.respond({type:"name_result", result:"invalid"}, response);
        break;

      case "create":
        var room = new Room(data.room_name, data.name);

        room.addUser(user);
        this.rooms.push(room);

        this.respond({type:"accepted"}, response);
        break;

      case "join":
        var room = this.getRoom(data.room_name, data.room_host);

        if(room === undefined || room.users.length === 4) {
          this.respond({type: "rejected"}, response);
          break;
        }

        room.addUser(user);

        var currentPlayers = "";

        for(var i=0; i<room.users.length; i++) {
            currentPlayers += room.users[i].name+",";
        }

        this.respond({type: "accepted", players: currentPlayers}, response);
        break;

      case "begin":
        if(user.inRoom && user.name === user.inRoom.host) {
          user.inRoom.hasStarted = true;
          this.respond({type: "accepted"}, response);
        }

        this.respond({type: "rejected"}, response);
        break;

      case "kick":
        if(user.inRoom && user.name === user.inRoom.host) {
          var target = user.inRoom.getUser(data.player_name);

          if(target !== undefined) {
            user.inRoom.disconnectUser(target, "Kicked From Lobby");
          }

          this.respond({type: "accepted"}, response);
        }

        this.respond({type: "rejected"}, response);
        break;


      case "leave":
        if(user.inRoom !== false) {
          user.inRoom.disconnectUser(user);
          this.respond({type:"accepted"}, response);
          break;
        }

        this.respond({type:"rejected"}, response);
        break;

      case "ping":
        user.lastTime = new Date().getTime();

        if(user.inRoom) {
          this.respond(user.pendingMessages, response);
          user.pendingMessages = [];
        } else {
          if(user.removed) {
            this.respond({type:"removed", reason:user.removed}, response);
            user.removed = false;
          } else {
            var room_list = "";

            if(this.rooms.length > 0) {
              for(var i=0; i<this.rooms.length; i++) {
                if(!this.rooms[i].hasStarted)
                  room_list += `${this.rooms[i].name} ${this.rooms[i].host} (${this.rooms[i].users.length}/4),`;
              }
            }

            this.respond({type:"room_list", room_list:room_list}, response);
          }
        }
        break;

      case "broadcast":
        if(user.inRoom !== false) {
          try {
            var obj = JSON.parse(data.msg);
            user.inRoom.broadcast(obj);
            this.respond({type:"accepted"}, response);
          } catch(e) {
            console.log("Invalid broadcast json");
            this.respond({type:"rejected"}, response);
          }

          break;
        }

        this.respond({type:"rejected"}, response);
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
