//FOR FRONTEND
// REALTIME SERVER CONNECT WITH ANOTHER PERSON

//emit will send to app.js will display for everyone
// socket.emit("churan bheja");
// socket.on("churan milgya", () => {
// });
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board(); //chess.board()--->Give all Dimension vgera of chess Board
  boardElement.innerHTML = ""; //nothing written on board

  board.forEach((row, rowindex) => {
    //Array
    row.forEach((square, squareindex) => {
      //For checkered Pattern
      const squareElement = document.createElement("div"); //Gives Squares on board for chess
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark" //gives Black and White Texture
      );
      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        //Squares Not NULL
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square); //piece
        pieceElement.draggable = playerRole === square.color; //white can't move other player's pieces
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement; //select the piece
            sourceSquare = { row: rowindex, col: squareindex }; //from where piece dragged
            e.dataTransfer.setData("text/plain", ""); //Cross Browsers No Problem
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement); //Piece now kept on The Square
      }

      //Make Square itself IMMOVABLE
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          //whenever draggedPiece in previous event listeners
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b'){
    boardElement.classList.add("flipped");
  }else{
    boardElement.classList.remove("flipped");

  }
};
const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    P: "♟",
    R: "♚",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };
  return unicodePieces[piece.type] || ""; //Piece return or Blank
};
socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  //New State of Board
  chess.load(fen); //Entire Equation is loaded
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

renderBoard();
// handleMove();
// getPieceUnicode();
