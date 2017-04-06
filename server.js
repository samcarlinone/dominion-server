//Lets require/import the HTTP module
const http = require('http');
const url = require('url');
const chat = require('./chat');

//Lets define a port we want to listen to
const PORT = process.env.PORT || 80;

console.log(chat);

//We need a function which handles requests and send response
function handleRequest(request, response){
  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });

  response.statusCode = 200;

  var in_url = url.parse(request.url, true);

  try {
    var data = JSON.parse(in_url.query.data);
  } catch(e) {
    response.end("<html><body>Cogito ergo sum.</body></html>");
    return;
  }

  chat.process(data, response);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: ", PORT);
});
