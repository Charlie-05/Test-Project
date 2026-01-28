(function () {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const gameOverEl = document.getElementById('gameOver');
  const restartBtn = document.getElementById('restartBtn');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let snake = [];
  let food = { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  let gameLoop = null;
  let gameRunning = false;

  function init() {
    snake = [
      { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) },
      { x: Math.floor(tileCount / 2) - 1, y: Math.floor(tileCount / 2) },
      { x: Math.floor(tileCount / 2) - 2, y: Math.floor(tileCount / 2) }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    placeFood();
    gameOverEl.classList.add('hidden');
    highScoreEl.textContent = highScore;
    updateScore();
    gameRunning = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, 120);
  }

  function placeFood() {
    let valid = false;
    let x, y;
    while (!valid) {
      x = Math.floor(Math.random() * tileCount);
      y = Math.floor(Math.random() * tileCount);
      valid = !snake.some(seg => seg.x === x && seg.y === y);
    }
    food = { x, y };
  }

  function tick() {
    if (!gameRunning) return;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      endGame();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
      }
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#4ecca3' : '#2d6a4f';
      ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      if (i === 0) {
        ctx.fillStyle = '#1a1a2e';
        const eyeSize = 3;
        const cx = seg.x * gridSize + gridSize / 2;
        const cy = seg.y * gridSize + gridSize / 2;
        const offset = 5;
        const ex1 = cx + (dx !== 0 ? dx * offset : -offset);
        const ey1 = cy + (dy !== 0 ? dy * offset : -offset);
        const ex2 = cx + (dx !== 0 ? dx * offset : offset);
        const ey2 = cy + (dy !== 0 ? dy * offset : -offset);
        ctx.fillRect(ex1 - eyeSize / 2, ey1 - eyeSize / 2, eyeSize, eyeSize);
        ctx.fillRect(ex2 - eyeSize / 2, ey2 - eyeSize / 2, eyeSize, eyeSize);
      }
    });

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  function updateScore() {
    scoreEl.textContent = score;
  }

  function endGame() {
    gameRunning = false;
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    gameOverEl.classList.remove('hidden');
  }

  document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.key !== ' ') return;
    switch (e.key) {
      case 'ArrowUp':
        if (dy !== 1) { dx = 0; dy = -1; }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (dy !== -1) { dx = 0; dy = 1; }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (dx !== 1) { dx = -1; dy = 0; }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (dx !== -1) { dx = 1; dy = 0; }
        e.preventDefault();
        break;
    }
  });

  restartBtn.addEventListener('click', init);

  init();
})();
