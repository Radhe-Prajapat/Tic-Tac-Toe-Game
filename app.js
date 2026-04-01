// ==========================================
// Select DOM Elements
// ==========================================
let boxes = document.querySelectorAll(".box"); // Selects all 9 game board squares
let resetbtn = document.querySelector("#Reset-btn"); // Button to clear the board
let newgamebtn = document.querySelector('#new-btn'); // Button to restart game from modal
let msgcontent = document.querySelector('.msg-content'); // Container for victory/draw modal
let msg = document.querySelector('#msg'); // Paragraph tag displaying winner text

// UI Controls for Theme and Game Mode
let themeToggle = document.querySelector('#theme-toggle'); // Light/Dark mode toggle switch
let themeLabel = document.querySelector('#theme-label'); // Label reflecting current theme
let gameModeSelect = document.querySelector('#game-mode'); // Dropdown to select PvP or PvE

// ==========================================
// Game State Variables
// ==========================================
let currentPlayer = 'O'; // Tracks whose turn it is. Human will always start as 'O'
let isPlayerVsComputer = false; // Tracks if game is against bot (PvE). Default is PvP.

// ==========================================
// Theme & Mode Listeners
// ==========================================

// Theme System: Toggles between Light and Dark mode
themeToggle.addEventListener('change', () => {
    if(themeToggle.checked) {
        document.body.classList.add('light-mode'); // Apply light mode styles
        themeLabel.innerText = 'Light Mode'; // Update UI label
    } else {
        document.body.classList.remove('light-mode'); // Revert back to dark mode
        themeLabel.innerText = 'Dark Mode'; // Update UI label
    }
});

// Mode Switch: Listens for changes in PvP/PvE dropdown selection
gameModeSelect.addEventListener('change', (e) => {
    isPlayerVsComputer = e.target.value === 'pve'; // Update mode flag based on select value
    resetGame(); // Restart game whenever mode changes to reset board state
});

// ==========================================
// Game Logic Constants & Reset
// ==========================================

// Winning Combinations (Indices of the 3x3 grid)
const winPatterns = [
    [0, 1, 2], [0, 3, 6], [0, 4, 8], // Top row, Left column, Main diagonal
    [1, 4, 7], [2, 5, 8], [2, 4, 6], // Middle column, Right column, Anti-diagonal
    [3, 4, 5], [6, 7, 8] // Middle row, Bottom row
];

// Resets the game to its initial state
const resetGame = () => {
    currentPlayer = 'O'; // Reset starting player to 'O'
    enableBoxes(); // Clear all boxes and enable clicking
    msgcontent.classList.add("hide"); // Hide the victory/draw modal UI
}

// ==========================================
// Player Move Logic
// ==========================================

// Add click event listeners to all 9 boxes
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if(box.innerText !== "") return; // Ignore click if box is already filled
        
        // Handling Human Turn: Player 1 is always 'O'
        if(currentPlayer === 'O') {
            makeMove(box, 'O'); // Execute 'O' move
            let isGameOver = checkWinnerOrDraw(); // Check if the move ended the game
            
            // If playing vs Computer and the game isn't over yet, trigger Computer Turn
            if(isPlayerVsComputer && !isGameOver) {
                // Wait briefly (600ms) for realism before bot moves
                setTimeout(computerMove, 600); 
            }
        } else if (!isPlayerVsComputer) {
            // Handling Human Turn: Player 2 is 'X' during PvP mode
            makeMove(box, 'X'); // Execute 'X' move
            checkWinnerOrDraw(); // Check if the move ended the game
        }
    });
});

// Helper function to handle a player's move on the UI board
const makeMove = (box, player) => {
    box.innerText = player; // Set X or O text inside the clicked box
    box.disabled = true; // Disable the box to prevent it from being altered
    
    // Apply relevant styling/classes and switch turn
    if(player === 'O') {
        box.classList.add("o-val"); // Add 'O' animation color
        box.classList.remove("x-val"); 
        currentPlayer = 'X'; // Switch turn to next player ('X' or Bot)
    } else {
        box.classList.add("x-val"); // Add 'X' animation color
        box.classList.remove("o-val");
        currentPlayer = 'O'; // Switch turn back to Player 'O'
    }
}

// ==========================================
// Computer Bot (AI) Logic
// ==========================================

// Helper function to scan board and return indices of all empty boxes
const getAvailableBoxes = () => {
    let available = [];
    boxes.forEach((box, i) => {
        if(box.innerText === "") available.push(i);
    });
    return available;
}

// Executes the bot's turn using basic AI priority rules
const computerMove = () => {
    let availableBoxes = getAvailableBoxes();
    // Stop if no empty boxes or if it's not the bot's turn
    if(availableBoxes.length === 0 || currentPlayer !== 'X') return;

    // AI Strategy execution order:
    // 1. Check if Bot (X) can win immediately
    let move = findBestMove('X');
    // 2. If it can't win, block the Player (O) from winning
    if(move === -1) move = findBestMove('O');
    // 3. If no immediate win or block, claim the middle box (index 4) if available
    if(move === -1 && availableBoxes.includes(4)) move = 4;
    // 4. If all else fails, pick a random available box
    if(move === -1) {
        let randomIndex = Math.floor(Math.random() * availableBoxes.length);
        move = availableBoxes[randomIndex];
    }
    
    // Execute the finalized AI move
    let box = boxes[move];
    makeMove(box, 'X');
    checkWinnerOrDraw(); // Verify if the AI won or drew during this move
}

// Helper function to detect if a specific player has a winning/blocking opportunity
const findBestMove = (player) => {
    for (let pos of winPatterns) {
        let val0 = boxes[pos[0]].innerText;
        let val1 = boxes[pos[1]].innerText;
        let val2 = boxes[pos[2]].innerText;

        // If 2 boxes in a row belong to the player and the 3rd is empty, return the empty index
        if (val0 === player && val1 === player && val2 === "") return pos[2];
        if (val0 === player && val2 === player && val1 === "") return pos[1];
        if (val1 === player && val2 === player && val0 === "") return pos[0];
    }
    return -1; // Return -1 if no strategic "2-in-a-row" block/win pattern is found
}

// ==========================================
// Win/Draw Condition Checks & Actions
// ==========================================

// Prevents further clicks by disabling all remaining empty boxes
const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
}

// Resets box state for a new game
const enableBoxes = () => {
    for (let box of boxes) {
        box.disabled = false; // Enable clicks again
        box.innerText = ""; // Clear text (X/O) inside box
        box.classList.remove("x-val", "o-val"); // Remove specific classes
    }
}

// Displays the victory modal with customized text and color
const showWinner = (winner) => {
    // Generate label based on winner and mode
    let winnerText = winner === 'O' ? 'Player O' : (isPlayerVsComputer ? 'Computer' : 'Player X');
    
    // Setup dynamic color/glow style string for winner
    let colorClass = winner === 'O' 
        ? 'color: var(--o-color); text-shadow: 0 0 15px var(--o-shadow);' 
        : 'color: var(--x-color); text-shadow: 0 0 15px var(--x-shadow);';
        
    // Update modal message element with embedded styling
    msg.innerHTML = `Victory!<br><span style="${colorClass}">${winnerText}</span> Wins! 🏆`;
    msgcontent.classList.remove('hide'); // Show modal
    disableBoxes(); // Ensure no further moves can be played
}

// Displays a draw message modal when no one wins
const showDraw = () => {
    msg.innerHTML = `Draw!<br><span style="color: var(--text-color);">Stalemate</span> 🛡️`;
    msgcontent.classList.remove('hide'); // Show modal
    disableBoxes();
}

// Main logic to determine if the board matches a win pattern or is completely filled
const checkWinnerOrDraw = () => {
    let winnerFound = false;

    // Loop through all winning combinations to cross-reference board state
    for (let pattern of winPatterns) {
        let pos0val = boxes[pattern[0]].innerText;
        let pos1val = boxes[pattern[1]].innerText;
        let pos2val = boxes[pattern[2]].innerText;

        // Condition for winning: Boxes are not empty and all 3 texts match
        if (pos0val !== '' && pos0val === pos1val && pos1val === pos2val) {
            showWinner(pos0val); // Trigger win display logic
            winnerFound = true;
            return true; // Return true as game is over
        }
    }

    // Checking for a draw scenario: no winner and 0 available empty boxes left
    if (!winnerFound && getAvailableBoxes().length === 0) {
        showDraw(); // Trigger draw display logic
        return true; // Return true as game is over
    }

    return false; // Return false indicating game is still active
};

// ==========================================
// Event Listeners for Game Resets
// ==========================================
newgamebtn.addEventListener("click", resetGame); // Resets game via modal button
resetbtn.addEventListener("click", resetGame); // Resets game via visible board button
