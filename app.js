const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
require("dotenv").config()

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});
//uniquesocket--> unique info about person who joined
//setup in index.ejs socket.io using CDN
io.on("connection", (uniquesocket) => {
  console.log("connected");
  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }
  uniquesocket.on("disconnect", () => {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });
  //
  uniquesocket.on("move", (move) => {
    // Chess.turn()-->BLACK/WHITE KI TURN
    // uniquesocket.id -->Individual User Belonging to white or Black
    //should be white's turn and only white player allowed to move
    try {
      //Just correct Player Moving --> 2 if statements
      if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
      //should be black's turn and only black player allowed to move
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      //yaha wrong move bhi aa skta hai
      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn(); //Whosoever's turn it is assign it
        io.emit("move", move); //sabke pass ye info bhejo
        io.emit("boardState", chess.fen()); //Gives Current state of Board After Moving
      } else {
        console.log("Invalid Move: ", move);
        uniquesocket.emit("Invalid Move", move); //Tells Only Specific User About Wrong Move
      }
    } catch (err) {
      //If Move is Wrong--->> const result = chess.move(move);
      console.log(err);
      uniquesocket.emit("Invalid Move", move);
    }
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server Activated: 5000");
});
