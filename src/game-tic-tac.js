import { INVALID_MOVE } from "boardgame.io/core";

const ROWS = 4;
const COLS = 4;
const WIN_CONDITION = 4;

export const TicTacToe = {
  setup: ({random, ctx}) => {
     return {
      cells: Array.from({length: ROWS}, () => Array(COLS).fill(null)),
      currentRow: null,
      currentCol: null,
      turnCount: 0,
      playerX: Math.floor(random.Number() * ctx.numPlayers),
      winner: null,
      gameover: false
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
        startGame: ({ G, playerID, events }) => {
          if(!(playerID == 0)) {
            return INVALID_MOVE;
          }
          else {
            events.endPhase();
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

          G.currentRow = row;
          G.currentCol = col;

          G.turnCount++;

          if(isWinner(G.currentRow, G.currentCol, G.cells)) {
            G.gameover = true;
            G.winner = playerID;
          }
          else if(G.turnCount == ROWS * COLS) {
            G.gameover = true;
          }
        },

        resetGame: ({ G, ctx, random }) => {
          G.cells = Array.from({length: ROWS}, () => Array(COLS).fill(null));
          G.currentRow = null;
          G.currentCol = null;
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
 * @param {*} row - the row placed on
 * @param {*} col - the col placed on
 * @returns - the boolean state of the player having won
 */
function isWinner(row, col, cells) {
    const win = WIN_CONDITION - 1;

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
 * @param {*} row - the row of the cell
 * @param {*} col - the col of the cell
 * @returns 
 */
function isValidCell(row, col, cells) {
    const rowValid = row >= 0 && row < cells.length;
    const colValid = col >= 0 && col < cells[0].length;
    
    return rowValid && colValid;
}