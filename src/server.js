const server = require("http").createServer();
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "myproject";

const saveNewGame = (game, socket) =>
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    // Get the games collection
    const collection = db.collection("games");

    // Insert some games
    collection.insertOne(game, {}, () => {
      console.log("Inserted 1 game into the collection");
      pushGames(socket);
    });
    client.close();
  });

const pushGames = socket =>
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    // Get the games collection
    const collection = db.collection("games");
    // Find some documents
    collection.find({}).toArray(function(err, games) {
      assert.equal(err, null);
      console.log("Found the records");
      socket.emit("pushGames", games);
    });
    client.close();
  });

io.on("connection", function(socket) {
  pushGames(socket);
  console.log("a user connected");
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("addGame", ({ name, user: { email } }) => {
    saveNewGame(
      { name, players: [email], status: "draft", owner: email },
      socket
    );
  });
});

server.listen(8000, function(err) {
  if (err) throw err;
  console.log("listening on port 8000");
});
