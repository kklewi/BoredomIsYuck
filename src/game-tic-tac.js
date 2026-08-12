import { INVALID_MOVE } from "boardgame.io/core";

export const TicTacToe = {
  setup: ({random, ctx}) => {
     return {
      amountToWin: null,
      cells: null, // Set when the start game phase begins
      turnCount: 0,
      playerX: Math.floor(random.Number() * ctx.numPlayers),
      winner: null,
      gameover: false,
      xWins: 0,
      oWins: 0,
  }
    },

  turn: {
    minMoves: 1,
    maxMoves: 1, 
  },
  phases: {
    setupPhase: {
      start: true,
      next: "playPhase",

      moves: {
        startGame: ({ G, playerID, events }, rows, cols, winAmount) => {
          if((playerID !== '0')) {
            return INVALID_MOVE;
          }
          else {
            events.endPhase();
            G.cells = Array.from({length: rows}, () => Array(cols).fill(null));
            G.amountToWin = winAmount;
          }
        }
      }
    },

    playPhase: {
      moves: {
        clickCell: ({ G, playerID }, row, col) => {
          if (G.cells[row][col] !== null || G.gameover) {
            return INVALID_MOVE;
          }
      
          G.cells[row][col] = playerID;

          G.turnCount++;

          if(isWinner(row, col, G.cells, G.amountToWin)) {
            G.gameover = true;
            G.winner = playerID;
            if(String(G.playerX) === playerID) {
              G.xWins++;
            }
            else {
              G.oWins++;
            }
          }
          else if(G.turnCount == G.cells.length * G.cells[0].length) {
            G.gameover = true;
          }
        },

        resetGame: ({ G, ctx, random }) => {
          G.cells = Array.from({length: G.cells.length}, () => Array(G.cells[0].length).fill(null));
          G.turnCount = 0;
          G.playerX = Math.floor(random.Number() * ctx.numPlayers);
          G.winner = null;
          G.gameover = false;
        }
      }
    }
  },
};

/**
 * Checks if the player that just moved is the winner
 * 
 * @param {number} row - the row placed on
 * @param {number} col - the col placed on
 * @param {*} cells - the state of the cells on the board
 * @param {number} winCondition 
 * @returns - the boolean state of the player having won
 */
function isWinner(row, col, cells, winCondition) {
    const win = winCondition - 1;

    // Vertical directions
    const top = amountInDirection(row, col, -1, 0, cells); 
    const bottom = amountInDirection(row, col, 1, 0, cells);

    // Horizontal Directions
    const left = amountInDirection(row, col, 0, -1, cells);
    const right = amountInDirection(row, col, 0, 1, cells);

    // Top left diagonal directions
    const topLeft = amountInDirection(row, col, -1, -1, cells);
    const bottomRight = amountInDirection(row, col, 1, 1, cells);

    // Top right diagonal directions
    const topRight = amountInDirection(row, col, -1, 1, cells);
    const bottomLeft = amountInDirection(row, col, 1, -1, cells);

    return top + bottom >= win || left + right >= win ||
        topLeft + bottomRight >= win || topRight + bottomLeft >= win;
}

/**
 * Gives the amount of slots matching the player's team in a given direction
 * 
 * @param {*} row - the row to start at
 * @param {*} col - the col to start at
 * @param {*} rowDirection - the row change per iteration
 * @param {*} colDirection - the col change per iteration
 * @returns - the integer representing the amount in the direction until invalid
 */
function amountInDirection(row, col, rowDirection, colDirection, cells) {
    let team = cells[row][col];
    let amount = 0; // the distance in the direction to return
    let newRow = row + rowDirection * (amount + 1);
    let newCol = col + colDirection * (amount + 1);

    while(isValidCell(newRow, newCol, cells) && cells[newRow][newCol] === team) {
        ++amount;
        newRow = row + rowDirection * (amount + 1);
        newCol = col + colDirection * (amount + 1);
    }
    return amount;
}

/**
 * Checks that a cell is within bounds of the board
 * 
 * @param {number} row - the row of the cell
 * @param {number} col - the col of the cell
 * @returns - the validity of the cell checked
 */
function isValidCell(row, col, cells) {
    const rowValid = row >= 0 && row < cells.length;
    const colValid = col >= 0 && col < cells[0].length;
    
    return rowValid && colValid;
}