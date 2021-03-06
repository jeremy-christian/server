const server = require("http").createServer();
const io = require("socket.io")(server);

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "myproject";

const saveNewGame = (game, socket) =>
  MongoClient.connect(url, function (err, client) {
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

const removeGame = (game, socket) =>
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    // Get the games collection
    const collection = db.collection("games");

    // Remove a game
    collection.deleteOne({ _id: ObjectId(game._id) }, () => {
      console.log("Removed 1 game from the collection");
      pushGames(socket);
    });
    client.close();
  });

const pushGames = (socket) =>
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    // Get the games collection
    const collection = db.collection("games");

    // Find some documents
    collection.find({}).toArray(function (err, games) {
      assert.equal(err, null);
      console.log("Found the records");
      socket.emit("pushGames", games);
    });
    client.close();
  });

io.on("connection", function (socket) {
  pushGames(socket);
  console.log("a user connected");
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  socket.on("addGame", ({ name, user }) => {
    saveNewGame(
      { name, players: [user], status: "draft", owner: user },
      socket
    );
  });
  socket.on("removeGame", ({ game }) => {
    removeGame(game, socket);
    console.log("firing remove ame");
  });
});

server.listen(8000, function (err) {
  if (err) throw err;
  console.log("listening on port 8000");
});
