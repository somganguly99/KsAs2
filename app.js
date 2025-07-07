document.addEventListener("DOMContentLoaded", function () {
  const items = ['\u00A0\u00A0\u00A0Easy\u00A0\u00A0\u00A0', '\u00A0\u00A0\u00A0Medium\u00A0\u00A0\u00A0', '\u00A0\u00A0\u00A0Hard\u00A0\u00A0\u00A0'];
  let currentIndex = 0;

  function showItem() {
    document.querySelector(".difficulty-mode").textContent = items[currentIndex];
  }

  window.nextItem = function () {
    currentIndex = (currentIndex + 1) % items.length;
    showItem();
  };

  window.prevItem = function () {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showItem();
  };

  let score = JSON.parse(localStorage.getItem("score")) || {
    wins: 0,
    loss: 0,
  };

  function updateScoreDisplay() {
    const scoreBoard = document.getElementById("scoreBoard");
    scoreBoard.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = `✅ Wins: ${score.wins}, ❌ Losses: ${score.loss}`;
    scoreBoard.appendChild(p);
  }

  updateScoreDisplay();

  let correctSolution = [];

  window.generateSudoku = function () {
    const difficulty = document.querySelector(".difficulty-mode").textContent.trim().toLowerCase();
    const grid = document.getElementById("sudokuGrid");
    grid.innerHTML = "";

    const board = generateFullSudoku();
    correctSolution = board.map(row => [...row]);

    const masked = maskBoard(board, difficulty);

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.pattern = "[1-9]";
        input.oninput = function () {
          this.value = this.value.replace(/[^1-9]/g, '');
        };
        input.onpaste = e => e.preventDefault();
        input.className = "sudoku-cell";
        input.dataset.row = row;
        input.dataset.col = col;

        if (masked[row][col] !== 0) {
          input.value = masked[row][col];
          input.readOnly = true;
          input.classList.add("prefilled");
        }

        grid.appendChild(input);
      }
    }

    document.getElementById("result").textContent = "";
  };

  window.checkSolution = function () {
    const inputs = document.querySelectorAll(".sudoku-cell");

    for (const input of inputs) {
      if (input.readOnly) continue;

      const row = parseInt(input.dataset.row);
      const col = parseInt(input.dataset.col);
      const val = Number(input.value);

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
    score.wins += 1;
    localStorage.setItem("score", JSON.stringify(score));
    updateScoreDisplay();
  };

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
    let cellsToRemove;

    if (difficulty === "easy") cellsToRemove = 35;
    else if (difficulty === "medium") cellsToRemove = 45;
    else cellsToRemove = 55;

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
});
