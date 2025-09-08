// script.js
let playerSymbol = 'X';
let aiSymbol = 'O';
let currentPlayer = playerSymbol;
let isGameOver = false;
let isPvC = false; // Player vs CPU mode flag
let difficulty = 'easy'; // default difficulty

const chooseXBtn = document.getElementById('choose-x');
const chooseOBtn = document.getElementById('choose-o');
const pvpBtn = document.getElementById('pvp-mode');
const pvcBtn = document.getElementById('pvc-mode');
const difficultySelector = document.getElementById('difficulty-selector');
const easyBtn = document.getElementById('easy-mode');
const mediumBtn = document.getElementById('medium-mode');
const hardBtn = document.getElementById('hard-mode');

const gameBoard = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-game');
const newMatchBtn = document.getElementById('new-match');

const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const currentPlayerDisplay = document.getElementById('current-player');
const gamesPlayedDisplay = document.getElementById('games-played');
const winRateDisplay = document.getElementById('win-rate');

let board = Array(9).fill(null);
let player1Score = 0;
let player2Score = 0;
let gamesPlayed = 0;

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function handleSymbolSelection(symbol) {
  playerSymbol = symbol;
  aiSymbol = symbol === 'X' ? 'O' : 'X';
  currentPlayer = playerSymbol;
  chooseXBtn.classList.toggle('active', symbol === 'X');
  chooseOBtn.classList.toggle('active', symbol === 'O');
  resetGame();
}

chooseXBtn.addEventListener('click', () => handleSymbolSelection('X'));
chooseOBtn.addEventListener('click', () => handleSymbolSelection('O'));

function updateCurrentPlayerText() {
  const playerName = currentPlayer === playerSymbol
    ? (player1NameInput.value || 'Player')
    : isPvC ? 'Computer' : (player2NameInput.value || 'Player 2');
  currentPlayerDisplay.textContent = `${playerName}'s Turn`;
}

function handleCellClick(index) {
  if (board[index] || isGameOver) return;

  makeMove(index, currentPlayer);

  if (!isGameOver && isPvC && currentPlayer === aiSymbol) {
    setTimeout(makeAIMove, 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());

  if (checkWinner(player)) {
    const winnerName = player === playerSymbol
      ? (player1NameInput.value || 'Player')
      : isPvC ? 'Computer' : (player2NameInput.value || 'Player 2');
    statusDisplay.textContent = `${winnerName} Wins!`;
    isGameOver = true;
    highlightWinningCells(player);
    updateScore(player);
    gamesPlayed++;
    updateStats();
  } else if (board.every(cell => cell)) {
    statusDisplay.textContent = "It's a draw!";
    isGameOver = true;
    gamesPlayed++;
    updateStats();
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateCurrentPlayerText();
  }
}

function makeAIMove() {
  let move;
  const emptyIndices = board.map((val, i) => val ? null : i).filter(i => i !== null);

  if (difficulty === 'easy') {
    move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  } else if (difficulty === 'medium') {
    move = findBestMove(board, aiSymbol, 1);
  } else if (difficulty === 'hard') {
    move = findBestMove(board, aiSymbol, -1);
  }
  makeMove(move, aiSymbol);
}

function findBestMove(boardState, player, depthLimit = 2) {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < boardState.length; i++) {
    if (!boardState[i]) {
      boardState[i] = player;
      let score = minimax(boardState, 0, false, depthLimit);
      boardState[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing, limit) {
  if (checkWinner(aiSymbol)) return 10 - depth;
  if (checkWinner(playerSymbol)) return depth - 10;
  if (boardState.every(cell => cell)) return 0;
  if (limit >= 0 && depth >= limit) return 0; // Limit depth for medium

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (!boardState[i]) {
        boardState[i] = aiSymbol;
        let score = minimax(boardState, depth + 1, false, limit);
        boardState[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (!boardState[i]) {
        boardState[i] = playerSymbol;
        let score = minimax(boardState, depth + 1, true, limit);
        boardState[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function highlightWinningCells(player) {
  for (const combo of winningCombinations) {
    if (combo.every(i => board[i] === player)) {
      combo.forEach(i => cells[i].classList.add('winning'));
    }
  }
}

function checkWinner(player) {
  return winningCombinations.some(combo => combo.every(i => board[i] === player));
}

function updateScore(player) {
  if (player === playerSymbol) {
    player1Score++;
    player1ScoreDisplay.textContent = player1Score;
  } else {
    player2Score++;
    player2ScoreDisplay.textContent = player2Score;
  }
}

function updateStats() {
  gamesPlayedDisplay.textContent = gamesPlayed;
  const totalWins = player1Score + player2Score;
  const winRate = totalWins > 0 ? Math.round((player1Score / totalWins) * 100) : 0;
  winRateDisplay.textContent = `${winRate}%`;
}

function resetGame() {
  board = Array(9).fill(null);
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  isGameOver = false;
  currentPlayer = playerSymbol;
  statusDisplay.textContent = '';
  updateCurrentPlayerText();
}

function startNewMatch() {
  resetGame();
}

function fullReset() {
  player1Score = 0;
  player2Score = 0;
  gamesPlayed = 0;
  player1ScoreDisplay.textContent = '0';
  player2ScoreDisplay.textContent = '0';
  updateStats();
  resetGame();
}

function toggleMode(isCPU) {
  isPvC = isCPU;
  pvcBtn.classList.toggle('active', isCPU);
  pvpBtn.classList.toggle('active', !isCPU);
  difficultySelector.style.display = isCPU ? 'flex' : 'none';

  if (isCPU) {
    player2NameInput.value = 'Computer';
    player2NameInput.disabled = true;
  } else {
    player2NameInput.value = '';
    player2NameInput.disabled = false;
  }

  fullReset();
}

function selectDifficulty(level) {
  difficulty = level;
  easyBtn.classList.toggle('active', level === 'easy');
  mediumBtn.classList.toggle('active', level === 'medium');
  hardBtn.classList.toggle('active', level === 'hard');
}

easyBtn.addEventListener('click', () => selectDifficulty('easy'));
mediumBtn.addEventListener('click', () => selectDifficulty('medium'));
hardBtn.addEventListener('click', () => selectDifficulty('hard'));

pvcBtn.addEventListener('click', () => toggleMode(true));
pvpBtn.addEventListener('click', () => toggleMode(false));

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => handleCellClick(index));
});

resetBtn.addEventListener('click', fullReset);
newMatchBtn.addEventListener('click', startNewMatch);

updateCurrentPlayerText();
