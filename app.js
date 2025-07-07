
document.addEventListener("DOMContentLoaded", function () {
  const levels = ['\u00A0\u00A0\u00A0Easy\u00A0\u00A0\u00A0', '\u00A0\u00A0\u00A0Medium\u00A0\u00A0\u00A0', '\u00A0\u00A0\u00A0Hard\u00A0\u00A0\u00A0'];
  let currentLevel = 0;
  let correctSolution = [];
  let score = JSON.parse(localStorage.getItem("score")) || { wins: 0, loss: 0 };

  function showLevel() {
    document.querySelector(".difficulty-mode").textContent = levels[currentLevel];
  }

  window.nextItem = () => { currentLevel = (currentLevel + 1) % levels.length; showLevel(); };
  window.prevItem = () => { currentLevel = (currentLevel - 1 + levels.length) % levels.length; showLevel(); };

  window.resetScore = () => {
    localStorage.clear("score");
    score = { wins: 0, loss: 0 };
    updateScoreDisplay();
  };

  function updateScoreDisplay() {
    const scoreBoard = document.getElementById("scoreBoard");
    scoreBoard.innerHTML = `<p>✅ Wins: ${score.wins}, ❌ Losses: ${score.loss}</p>`;
  }

  function getDifficulty() {
    return document.querySelector(".difficulty-mode").textContent.trim().toLowerCase();
  }

  function createCell(row, col, value = "", readOnly = false, isPrefilled = false) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.pattern = "[1-9]";
    input.value = value || "";
    input.readOnly = readOnly;
    input.className = "sudoku-cell";
    input.dataset.row = row;
    input.dataset.col = col;

    if (!readOnly) {
      input.oninput = function () {
        this.value = this.value.replace(/[^1-9]/g, '');
        validateAllConflicts();
      };
      input.onpaste = e => e.preventDefault();
    }

    if (isPrefilled) input.classList.add("prefilled");
    return input;
  }

  function renderEmptyGrid() {
    const grid = document.getElementById("sudokuGrid");
    grid.innerHTML = "";
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        grid.appendChild(createCell(row, col, "", true));
      }
    }
  }


  window.generateSudoku = () => {
    const difficulty = getDifficulty();
    const grid = document.getElementById("sudokuGrid");
    grid.innerHTML = "";

    const board = generateFullSudoku();
    correctSolution = board.map(row => [...row]);
    const masked = maskBoard(board, difficulty);

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = masked[row][col];
        const readOnly = value !== 0;
        const cell = createCell(row, col, value || "", readOnly, readOnly);
        grid.appendChild(cell);
      }
    }

    document.getElementById("result").textContent = "";
    
  };

  window.resetSudoku = () => {
    document.querySelectorAll(".sudoku-cell").forEach(input => {
      if (!input.readOnly) {
        input.value = "";
        input.classList.remove("conflict");
        input.style.backgroundColor = "";
        input.style.color = "";
      }
    });
    clearConflictStyles();
    document.getElementById("result").textContent = "";
  };

  window.checkSolution = () => {
    const inputs = document.querySelectorAll(".sudoku-cell");
    for (const input of inputs) {
      if (input.readOnly) continue;
      const row = +input.dataset.row, col = +input.dataset.col, val = +input.value;
      if (isNaN(val) || val !== correctSolution[row][col]) {
        input.style.backgroundColor = "#ffcccc";
        document.getElementById("result").textContent = "❌ Incorrect Solution. Try Again!";
        document.getElementById("result").style.color = "red";
        score.loss += 1;
        localStorage.setItem("score", JSON.stringify(score));
        updateScoreDisplay();
        return;
      } else {
        input.style.backgroundColor = "white";
      }
    }
    document.getElementById("result").textContent = "✅ Correct! Well done!";
    document.getElementById("result").style.color = "green";
    alert("Congratulations! You solved the Sudoku puzzle!");
    score.wins += 1;
    localStorage.setItem("score", JSON.stringify(score));
    updateScoreDisplay();
  };

  function validateAllConflicts() {
    clearConflictStyles();
    const cells = document.querySelectorAll(".sudoku-cell");
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    cells.forEach(cell => {
      const row = +cell.dataset.row;
      const col = +cell.dataset.col;
      const value = +cell.value;
      if (!isNaN(value)) board[row][col] = value;
    });

    cells.forEach(cell => {
      const row = +cell.dataset.row;
      const col = +cell.dataset.col;
      const value = board[row][col];
      if (!value) return;
      board[row][col] = 0;

      for (let i = 0; i < 9; i++) {
        if (board[row][i] === value) markConflict(cell, getCell(row, i));
        if (board[i][col] === value) markConflict(cell, getCell(i, col));
      }

      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = startRow + i, c = startCol + j;
          if (board[r][c] === value) markConflict(cell, getCell(r, c));
        }
      }
      board[row][col] = value;
    });
  }

  function markConflict(...cells) {
    cells.forEach(cell => {
      if (cell) cell.classList.add("conflict");
    });
  }

  function clearConflictStyles() {
    document.querySelectorAll(".sudoku-cell").forEach(cell => cell.classList.remove("conflict"));
    document.getElementById("result").textContent = "";
  }

  function getCell(row, col) {
    return document.querySelector(`.sudoku-cell[data-row="\${row}"][data-col="\${col}"]`);
  }

  function generateFullSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    solve(board);
    return board;
  }

  function solve(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function isSafe(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function maskBoard(board, difficulty) {
    const clone = board.map(row => [...row]);
    let cellsToRemove = difficulty === "easy" ? 35 : difficulty === "medium" ? 45 : 55;
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (clone[row][col] !== 0) {
        clone[row][col] = 0;
        cellsToRemove--;
      }
    }
    return clone;
  }

  showLevel();
  updateScoreDisplay();
  renderEmptyGrid();
});
