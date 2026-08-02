
import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';
import { GAME_RULES } from './Constants'

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

        const winnerText = document.createElement("h1");
        winnerText.classList.add(".winner-text");
        winnerText.id = "winner-text";
        winnerText.style.marginBottom = "20px";
        this.rootElement.appendChild(winnerText);
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
            switch (parseInt(cellValue)) {
                case 0:
                    cell.innerHTML = '<h1 class="red-text"> X </h1>';
                    break;
                case 1:
                    cell.innerHTML = '<h1 class="blue-text"> O </h1>';
                    break;
            }
        }
        else {
            cell.innerHTML = '';
        }
    });

    const messageEl = document.getElementById("winner-text");

    if (state.ctx.gameover) {
        const isDraw = state.ctx.gameover.winner == undefined;

        if (isDraw) {
            messageEl.textContent = 'Draw!';
            messageEl.classList.add("purple-text");
        }
        else {
            switch(parseInt(state.ctx.gameover.winner)) {
                case 0:
                    messageEl.textContent = "X wins!";
                    messageEl.classList.add("red-text");
                    break;
                case 1: 
                    messageEl.textContent = "O wins!";
                    messageEl.classList.add("blue-text");
                    break;
            }
        }

    }
    else {
        messageEl.textContent = '';
    }
  }
}

const appElement = document.getElementById('app');
const app = new TicTacToeClient(appElement);