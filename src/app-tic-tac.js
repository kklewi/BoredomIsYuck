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

        this.rootElement.appendChild(this.createTitleText());

        this.rootElement.appendChild(this.createRulesMenu());

        this.attachListenersRuleMenu();

        this.client.subscribe(state => this.update(state));
    }

    /**
     * Creates the title text that is used to display the winner and the title.
     * @returns - the object of the div containing the title text.
     */
    createTitleText() {
        const title = document.createElement('div');
        const titleText = document.createElement('h1');
        titleText.id = 'title-text';
        titleText.classList.add('top-text')
        titleText.classList.add('title-text')
        titleText.textContent = "tic tac woah";

        title.appendChild(titleText);

        return title;
    }

    /**
     * Creates the ui for the game phase.
     */
    createGameUI() {
        this.rootElement.appendChild(this.createGrid());
        this.rootElement.appendChild(this.createToolBar());

        this.attachListenersGame();
        
        const body = document.getElementById('body');

        // Add the styling for gameplay
        body.classList.add('tic-tac-body');
    }


    /**
     * The rules menu that allows the player to set the grid size and win condition.
     * @returns The rules menu object.
     */
    createRulesMenu() {

        const ruleMenu = document.createElement("div");
        ruleMenu.id = "rule-menu";

        // Add the panel to the menu
        const panel = document.createElement('div');
        panel.classList.add('panel');
        panel.id = 'rule-panel';

        panel.appendChild(this.createPanelHeader());

        const widthSlider = this.createSlider('col', 'Board Width');
        const heightSlider = this.createSlider('row', 'Board Height');
        const winSlider = this.createSlider('win', 'Win Condition');

        panel.appendChild(widthSlider);
        panel.appendChild(heightSlider);
        panel.appendChild(winSlider);

        // Create next phase button
        const createGameButton = this.createMenuButton("create-game-button", "⏎", "submit-button");
        createGameButton.style.background = "linear-gradient(7deg, black, var(--panel))"

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
     * Creates a slider with a label, a readout, ticks and labels for those ticks
     * @param {*} id - the id for the slider to be made
     * @param {*} label - the label text for the slider
     * @param {*} min - the minimum value of the slider
     * @param {*} max - the maximum value of the slider
     * @param {*} step - how much the slider increases or decreases by
     * @param {*} value - the default value of the slider
     * @returns - the object of the slider wrapper div
     */
    createSlider(id, label, min = 3, max = 10, step = 1, value = 3) {
        const slider = document.createElement('div');
        slider.classList.add('slider-wrapper');

        const sliderHead = this.createSliderHead(id, label);

        // Create wrapper for the track
        const trackWrapper = document.createElement('div');
        trackWrapper.classList.add('track-wrapper');

        // Create the actual track
        const track = document.createElement('input');
        track.type = 'range';
        track.id = id;
        track.min = min;
        track.max = max;
        track.step = step;
        track.value = value;
    
        const readout = sliderHead.lastChild;


        // Updates the fill of the track and the readout every time the user changes the value
        track.addEventListener('input', () => this.trackFill(track, readout));
        this.trackFill(track, readout);

        trackWrapper.appendChild(track);

        // Create the slider ticks
        const ticks = this.createSliderTicks(min, max, step);

        slider.appendChild(sliderHead);
        slider.appendChild(trackWrapper);
        slider.appendChild(ticks);

        return slider;
    }

    /**
     * Creates the "head" of the slider, the label and the corresponding readout
     * 
     * @param {*} id - the id of the slider
     * @param {*} labelText - the text for the slider
     * @returns - the object for the head of the slider
     */
    createSliderHead(id, labelText) {
        const sliderHead = document.createElement('div');
        sliderHead.classList.add('slider-head');

        // Create the label the describes the slider
        const label = document.createElement('label');
        label.for = id;
        label.textContent = labelText;

        // Create the readout box shows the current value
        const readout = document.createElement('span');
        readout.classList.add('readout');
        readout.id = id + "-val";
        readout.textContent = 3;

        // Add readout and label to slider head
        sliderHead.appendChild(label);
        sliderHead.appendChild(readout);

        return sliderHead;
    }

    /**
     * Creates the marks and labels that sit bellow steps along a track
     * 
     * @param {number} min - the minimum value of the slider
     * @param {number} max - the maximum value of the slider
     * @param {number} step - the step up for each tick mark
     * @returns - the marks and ticks wrapper element
     */
    createSliderTicks(min, max, step) {
        const THUMB = 18;
        const ticks = document.createElement('div');
        ticks.classList.add('ticks');
        
        for(let i = min; i <= max; i += step) {
            const fraction = (i - min) / (max - min);

            const tick = document.createElement('div');
            tick.classList.add('tick');
            tick.style.left = `calc((100% - ${THUMB}px) * ${fraction} + ${THUMB / 2}px)`;


            const mark = document.createElement('div');
            mark.className = 'tick-mark';

            const label = document.createElement('div');
            label.className = 'tick-label';
            label.textContent = i;

            // Add pieces of tick to container
            tick.appendChild(mark);
            tick.appendChild(label);

            // Add completed tick to the set of ticks
            ticks.appendChild(tick);
        }

        return ticks;
    }

    /**
     * Fills in the part of the track before the thumb and updates the readout
     * 
     * @param {*} track - the track object to update
     * @param {*} readout - the readout object to update
     */
    trackFill(track, readout) {
        const percent = (+track.value - +track.min) / (+track.max - +track.min) * 100;

        track.style.background =
        `linear-gradient(90deg, var(--blue-accent) 0%, var(--blue-accent) ${percent}%, var(--track) ${percent}%, var(--track) 100%)`;
        
        readout.textContent = +track.value;
    }


    /**
     * Generates the grid of spaces for the board
     * @returns - the object of the game board.
     */
    createGrid() {
        const gameBoard = document.createElement('div');
        gameBoard.classList.add("game-board");

        const rows = parseInt(document.getElementById("row-val").textContent);
        const cols = parseInt(document.getElementById("col-val").textContent);

        for (let i = 0; i < rows; i++) {
            let row = document.createElement("div");
            row.classList.add("row");

            for (let j = 0; j < cols; j++) {
                let button = document.createElement("button");
                button.dataset.id = String(i) + "-" + String(j);
                button.classList.add("tic-tac-button");
                row.appendChild(button);
            }
            gameBoard.appendChild(row);
        }
        return gameBoard;

    }

    /**
     * Creates the "toolbar", which holds the control buttons for the game
     * @returns - the object of the wrapper holding the control buttons
     */
    createToolBar() {
        const toolBar = document.createElement("div");

        // Create reset button
        const resetButton = this.createMenuButton("reset-button", "⟳", "game-button");
        //resetButton.style.padding = '2px';

        // Create home button
        const homeButton = this.createMenuLinkButton("home-button", "⌂", "/index.html", "game-button");

        // Append buttons
        toolBar.appendChild(resetButton);
        toolBar.appendChild(homeButton);

        toolBar.classList.add('tool-bar');

        return toolBar;
    }

    /**
     * Creates a menu button with an id, inner text and an optional extra class
     * @param {*} id - the id of the button to be made
     * @param {*} text - the text of the button to be made
     * @param {*} extraClass - the optional extra class of the button to be made
     * @returns - the menubutton object
     */
    createMenuButton(id, text, extraClass = null) {
        const menuButton = document.createElement("button");
        menuButton.classList.add("menu-button");
        menuButton.id = id;
        menuButton.textContent = text;

        if (extraClass !== null) {
            menuButton.classList.add(extraClass);
        }

        return menuButton;
    }

    /**
     * Creates a menu button wrapped in a link, so that you can go to different page.
     * @param {*} id - the id of the button to be made
     * @param {*} text - the text content of the button to be made
     * @param {*} href - the link to page that the button will link to
     * @param {*} extraClass - add optional extra class to apply to the button and not the wrapper.
     * @returns - the object of the wrapper link containing the button child.
     */
    createMenuLinkButton(id, text, href, extraClass = null) {
        const menuButtonWrapper = document.createElement('a');
        menuButtonWrapper.href = href;
        menuButtonWrapper.appendChild(this.createMenuButton(id, text, extraClass));

        return menuButtonWrapper;
    }

    /**
     * Attaches listeners for the rules menu with the exception of the slider input.
     */
    attachListenersRuleMenu() {
        const handleStartGame = event => {
            this.createGameUI();
            this.attachListenersGame();

            const rows = parseInt(document.getElementById("row-val").textContent);
            const cols = parseInt(document.getElementById("col-val").textContent);
            const winVal = parseInt(document.getElementById("win-val").textContent);
            console.log("win val: " + winVal);
            this.client.moves.startGame(rows, cols, winVal);

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
            winnerMessage.classList.add('title-text');
            winnerMessage.classList.add('top-text');
            console.log(winnerMessage.classList);
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

            // State change for gameover
            if (state.G.gameover) {
                winnerMessage.classList.remove('title-text');
                winnerMessage.style.fontSize = '7vh';
                if (state.G.winner == null) {
                    winnerMessage.textContent = 'Draw!';
                    winnerMessage.classList.add("pastel-purple");
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
        }
    }
    
}

const appElement = document.getElementById('app');
const app = new TicTacToeClient(appElement);