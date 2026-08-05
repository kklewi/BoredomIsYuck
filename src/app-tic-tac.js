import { Client } from 'boardgame.io/client';
import { TicTacToe } from './game-tic-tac';

class TicTacToeClient {
    constructor(rootElement) {
        this.client = Client({ 
            game: TicTacToe, 
            debug: false
        });
        this.client.start();

        this.rootElement = rootElement;

        this.rootElement.appendChild(this.createRulesMenu());

        this.attachListenersRuleMenu();

        this.client.subscribe(state => this.update(state));
    }

    createGameUI() {
        this.rootElement.appendChild(this.createGrid());
        this.rootElement.appendChild(this.createToolBar());
        this.rootElement.appendChild(this.createWinnerText());

        this.attachListenersGame();
        
        const body = document.getElementById('body');

        // Remove the styling for the rules menu
        body.classList.remove('rule-body');

        // Add the styling for gameplay
        body.classList.add('tic-tac-body');
    }

    /**Helper functions for the UI in order of use */


    /**
     * The rules menu that allows the player to set the grid size and win condition.
     * @returns The rules menu object.
     */
    createRulesMenu() {
        // Set the styling up for the rules menu
        document.getElementById('body').classList.add('rule-body');

        const ruleMenu = document.createElement("div");
        ruleMenu.id = "rule-menu";

        // Add the panel to the menu
        const panel = document.createElement('div');
        panel.classList.add('panel');
        panel.id = 'rule-panel';

        panel.appendChild(this.createPanelHeader());

        // Create next phase button
        const createGameButton = this.createMenuButton("create-game-button", "Create Game");

        console.log(createGameButton)
        ruleMenu.appendChild(panel);
        ruleMenu.appendChild(createGameButton);

        return ruleMenu;
    }

    createPanelHeader() {
        // Add panel header
        const panelHeader = document.createElement('div');
        panelHeader.id = 'panel-header';
        panelHeader.classList.add('panel-head');
        
        // Add heading text to panel header
        const panelHeaderText = document.createElement('h1');
        panelHeaderText.id = 'panel-header-text';
        panelHeaderText.textContent = 'Tic Tac Rules'
        panelHeader.appendChild(panelHeaderText);

        return panelHeader;
    }


    /**
     * Generates the grid of spaces for the board
     */
    createGrid() {
        const gameBoard = document.createElement('div');
        gameBoard.classList.add("game-board");

        for (let i = 0; i < 4; i++) {
            let row = document.createElement("div");
            row.classList.add("row");

            for (let j = 0; j < 4; j++) {
                let button = document.createElement("button");
                button.dataset.id = String(i) + "-" + String(j);
                button.classList.add("tic-tac-button");
                row.appendChild(button);
            }
            gameBoard.appendChild(row);
        }
        return gameBoard;

    }

    createWinnerText () {
        const winnerText = document.createElement("h1");
        winnerText.id = "winner-text";
        winnerText.style.marginBottom = "20px";
        return winnerText;
    }

    createToolBar() {
        const toolBar = document.createElement("div");

        // Create reset button
        const resetButton = this.createMenuButton("reset-button", "Reset");
        //resetButton.style.padding = '2px';

        // Create home button
        const homeButton = this.createMenuLinkButton("home-button", "Home", "/index.html");

        // Append buttons
        toolBar.appendChild(resetButton);
        toolBar.appendChild(homeButton);

        toolBar.classList.add('tool-bar');

        return toolBar;
    }

    createMenuButton(id, text) {
        console.log(typeof(id));
        const menuButton = document.createElement("button");
        menuButton.classList.add("menu-button");
        menuButton.id = id;
        menuButton.textContent = text;
        return menuButton;
    }

    createMenuLinkButton(id, text, href) {
        const menuButtonWrapper = document.createElement('a');
        menuButtonWrapper.href = href;
        menuButtonWrapper.appendChild(this.createMenuButton(id, text));
        return menuButtonWrapper;
    }

    attachListenersRuleMenu() {
        const handleStartGame = event => {
            this.client.moves.startGame();
            this.createGameUI();
            this.attachListenersGame();
            const ruleMenu = document.getElementById('rule-menu');
            ruleMenu.remove();
        }

        this.attachListener(handleStartGame, "create-game-button");
  }

  attachListenersGame() {
        // This event handler will read the cell id from a cell’s
        // `data-id` attribute and make the `clickCell` move.
        const handleCellClick = event => {
          const id = event.target.dataset.id;
        
          const rowID = parseInt(id.split('-')[0]);
          const colID = parseInt(id.split('-')[1]);

          this.client.moves.clickCell(rowID, colID);
        };

        const handleReset = event => {
            this.client.moves.resetGame();
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.innerText = '';
            });
            const winnerMessage = document.getElementById("title-text");
            winnerMessage.textContent = 'TIC TAC WOAH';
            winnerMessage.className = 'h1';
            winnerMessage.classList.add('pastel-yellow');
        }
        // Attach the event listener to each of the board cells.
        const cells = this.rootElement.querySelectorAll('.tic-tac-button');
        cells.forEach(cell => {
          cell.onclick = handleCellClick;
        });

        this.attachListener(handleReset, "reset-button")
  }
  
  /**
   * Attaches a handler to an element based on its id.
   * 
   * @param {*} handler - the space that the event is handled.
   * @param {*} id - the id of the thing to attach the handler to.
   */
  attachListener(handler, id) {
    console.log("Handler: " + handler);
    console.log("ID: "+ id);
    console.log("button: " + document.getElementById(id));
    const button = document.getElementById(id);
    button.onclick = handler;
  }

  update(state) {
    if(state.ctx.phase == "setupPhase") {

    }
    else if (state.ctx.phase == "playPhase"){
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

            const winnerMessage = document.getElementById("title-text");

            if (state.G.gameover) {
                winnerMessage.classList.remove('pastel-yellow');
                winnerMessage.style.fontSize = '7vh';
                if (state.G.winner == null) {
                    winnerMessage.textContent = 'Draw!';
                    winnerMessage.classList.add("pastel-purple");
                }
                else {
                    if(state.G.winner == state.G.playerX) {
                        winnerMessage.classList.add("basic-red");
                        winnerMessage.textContent = "X wins!";
                    }
                    else {
                        winnerMessage.classList.add("basic-blue");
                        winnerMessage.textContent = "O wins!";
                    }
                }
            }
        }
    }
    
}

const appElement = document.getElementById('app');
const app = new TicTacToeClient(appElement);