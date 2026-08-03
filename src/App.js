
import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';
import { GAME_RULES } from './Constants'
import { reset } from 'boardgame.io/core/';

class TicTacToeClient {
    constructor(rootElement) {
        this.client = Client({ game: TicTacToe });
        this.client.start();

        this.rootElement = rootElement;
        this.generateGrid();
        this.attachListeners();

        this.client.subscribe(state => this.update(state));
    }

    generateGrid() {
        for (let i = 0; i < GAME_RULES.ROWS; i++) {
            let row = document.createElement("div");
            row.classList.add("row");

            for (let j = 0; j < GAME_RULES.COLS; j++) {
                let button = document.createElement("button");
                button.dataset.id = String(i) + "-" + String(j);
                button.classList.add("tic-tac-button");
                row.appendChild(button);
            }
            this.rootElement.appendChild(row);
        }
        this.rootElement.classList.add("game-board");

        const resetBar = this.createToolBar();

        this.rootElement.appendChild(resetBar);

        const winnerText = document.createElement("h1");
        winnerText.id = "winner-text";
        winnerText.style.marginBottom = "20px";
        this.rootElement.appendChild(winnerText);


    }

    createToolBar() {
        const resetBar = document.createElement("div");
        const resetButton = document.createElement("button");
        resetButton.classList.add("icon-button");
        resetButton.classList.add("reset-button")
        resetButton.id = "reset-button";
        resetBar.appendChild(resetButton);
        return resetBar;
    }

    attachListeners() {
        // This event handler will read the cell id from a cell’s
        // `data-id` attribute and make the `clickCell` move.
        const handleCellClick = event => {
          const id = event.target.dataset.id;
        
          const rowID = parseInt(id.split('-')[0]);
          const colID = parseInt(id.split('-')[1]);

          this.client.moves.clickCell(rowID, colID);
        };
        // Attach the event listener to each of the board cells.
        const cells = this.rootElement.querySelectorAll('.tic-tac-button');
        cells.forEach(cell => {
          cell.onclick = handleCellClick;
        });

        const handleReset = event => {
            this.client.moves.resetGame();
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.innerText = '';
            });

            const winnerMessage = document.getElementById("winner-text");
            winnerMessage.textContent = '';
            winnerMessage.className = 'h1';
        }
        const resetButton = document.getElementById("reset-button");
        resetButton.onclick = handleReset;
  }

  update(state) {
    // Get all the board cells.
    const cells = this.rootElement.querySelectorAll('.tic-tac-button');

    // Update cells to display the values in the game state.
    cells.forEach(cell => {
        const cellID = cell.dataset.id;
        const rowID = parseInt(cellID.split('-')[0]);
        const colID = parseInt(cellID.split('-')[1]);
        const cellValue = state.G.cells[rowID][colID];

        if(cellValue !== null) {
            if (cellValue == state.G.playerX) {
                cell.innerHTML = '<h1 class="red-text"> X </h1>';
            }
            else {
                cell.innerHTML = '<h1 class="blue-text"> O </h1>';
            }
        }
        else {
            cell.innerHTML = '';
        }
    });

    const winnerMessage = document.getElementById("winner-text");

    if (state.G.gameover) {
        console.log("gameover")
        if (state.G.winner == null) {
            winnerMessage.textContent = 'Draw!';
            winnerMessage.classList.add("purple-text");
        }
        else {
            if(state.G.winner == state.G.playerX) {
                winnerMessage.classList.add("red-text");
                winnerMessage.textContent = "X wins!";
            }
            else {
                winnerMessage.classList.add("blue-text");
                winnerMessage.textContent = "O wins!";
            }
        }

    }
    else {
        winnerMessage.textContent = '';
        winnerMessage.className = 'h1';
    }
  }
}

const appElement = document.getElementById('app');
const app = new TicTacToeClient(appElement);