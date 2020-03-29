const server = require("http").createServer();
const io = require("socket.io")(server);

const games = [];

io.on("connection", function(socket) {
  // connect / disconnect
  socket.emit("pushGames", games);
  console.log("a user connected");
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("addGame", function(name) {
    games.push({ name, players: [], status: "draft" });
    console.log("new game", name);
    io.emit("pushGames", games);
  });
});

server.listen(8000, function(err) {
  if (err) throw err;
  console.log("listening on port 8000");
});
