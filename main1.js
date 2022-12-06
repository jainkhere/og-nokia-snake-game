var debug = {
  x: [],
  y: [],
};
(function (debug) {
  var width = 20;
  var height = 20;
  var renderer = new X.renderer3D();
  renderer.container = "playground";
  renderer.init();

  clearRenderer(width, height);

  var msg = document.getElementById("msg");
  var actualScore = document.getElementById("actual-score");
  var bestScore = document.getElementById("best-score");
  var width = 20;
  var height = 20;
  var gameOn = 0;
  var speed = 1;
  var endGame = new Event("endGame");
  var scores = createScores();
  var interval;
  var anim;

  document.addEventListener(
    "endGame",
    function endGameHandler(e) {
      msg.innerHTML = "Game Over! Press Space to start a new game";
      gameOn = 0;
      window.cancelAnimationFrame(anim);
      clearInterval(interval);
      scores.stop();
    },
    false
  );

  document.addEventListener(
    "keydown",
    function spaceHandler(e) {
      if (e.keyCode === 32) {
        e.preventDefault();
        if (!gameOn) {
          msg.innerHTML = "Go!";
          gameOn = 1;
          game();
        }
      }
    },
    false
  );

  function clearRenderer(width, height) {
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        var cube = new X.cube();
        cube.center = [25 * i, 25 * j, 0];
        cube.color = [1, 1, 1];

        renderer.add(cube);
      }
    }
  }

  function game() {
    var snake = createSnake(speed);
    var nextDir = "";

    scores.start();

    document.addEventListener("keydown", arrowsHandler, false);

    function arrowsHandler(e) {
      switch (e.keyCode) {
        case 83:
        case 40: //down
          e.preventDefault();
          nextDir = "down";
          break;
        case 68:
        case 39: //right
          e.preventDefault();
          nextDir = "right";
          break;
        case 38:
        case 87: //up
          e.preventDefault();
          nextDir = "up";
          break;
        case 65:
        case 37: //left
          e.preventDefault();
          nextDir = "left";
          break;
        default:
      }
    }
    function play() {
      // renderer.init();
      clearRenderer(width, height);
      if (snake.x[0] % 10 === 0 && snake.y[0] % 10 === 0) {
        snake.update();
        snake.changeDir(nextDir);
      }
      snake.move();
      snake.draw();

      if (snake.collides(20, 20)) {
        document.dispatchEvent(endGame);
      } else {
        anim = window.requestAnimationFrame(play);
      }
      debug.x = snake.x;
      debug.y = snake.y;
    }

    anim = window.requestAnimationFrame(play);
  }
  function createCandy(width, height) {
    var _candy = createFood(width, height, "#ED0916");
    _candy.active = false;
    return _candy;
  }
  function createFood(width, height, color) {
    return {
      x: 0,
      y: 0,
      // spawn the food in a random free space
      spawn: function (posX, posY) {
        var matrix = [],
          free = [],
          x,
          y,
          foodPos,
          i,
          len;
        for (i = 0; i < 20; i++) {
          matrix[i] = Array(20).fill(0);
        }
        for (i = 0, len = posX.length; i < len; i++) {
          x = Math.floor(posX[i] / 10);
          y = Math.floor(posY[i] / 10);
          matrix[y][x] = 1;
        }

        for (i = 0; i < 20; i++) {
          for (var j = 0; j < 20; j++) {
            if (!matrix[i][j]) free.push([i, j]);
          }
        }
        foodPos = Math.floor(Math.random() * free.length);
        this.x = free[foodPos][1] * 10;
        this.y = free[foodPos][0] * 10;
      },
      draw: function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      },
    };
  }
  function createSnake(speed) {
    function unshiftAndCut(arr) {
      var result = arr.slice();
      return result.map(function (el, i) {
        if (!i) return arr[0];
        return arr[i - 1];
      });
    }
    return {
      x: [0],
      y: [0],
      dx: [speed],
      dy: [0],
      changeDir: function (nextDir) {
        if (this.dx[0] && nextDir === "up") {
          this.dx[0] = 0;
          this.dy[0] = -speed;
        }
        if (this.dx[0] && nextDir === "down") {
          this.dx[0] = 0;
          this.dy[0] = speed;
        }
        if (this.dy[0] && nextDir === "right") {
          this.dx[0] = speed;
          this.dy[0] = 0;
        }
        if (this.dy[0] && nextDir === "left") {
          this.dx[0] = -speed;
          this.dy[0] = 0;
        }
      },
      draw: function () {
        for (var i = 0, len = this.x.length; i < len; i++) {
          var snake_cube = new X.cube();
          snake_cube.center = [25 * (this.x[i] - 1), 25 * this.y[i], 0];
          snake_cube.color = [1, 0, 0];
          renderer.add(snake_cube);
          // ctx.beginPath();
          // ctx.rect(this.x[i], this.y[i], 10, 10);
          // ctx.fillStyle = "#2B823A";
          // ctx.strokeStyle = "#012E34";
          // ctx.fill();
          // ctx.stroke();
          // ctx.closePath();
        }
      },
      update: function () {
        this.dx = unshiftAndCut(this.dx);
        this.dy = unshiftAndCut(this.dy);
      },
      grow: function () {
        var lastX = this.x[this.x.length - 1];
        var lastY = this.y[this.y.length - 1];
        var lastDX = this.dx[this.dx.length - 1];
        var lastDY = this.dy[this.dy.length - 1];
        this.x.push(lastX - Math.sign(lastDX) * 10);
        this.y.push(lastY - Math.sign(lastDY) * 10);
        this.dx.push(lastDX);
        this.dy.push(lastDY);
      },
      move: function () {
        for (var i = 0, len = this.x.length; i < len; i++) {
          this.x[i] += this.dx[i];
          this.y[i] += this.dy[i];
        }
      },
      collides: function (width, height) {
        var x = this.x[0],
          y = this.y[0];
        // Check collision with the wall
        if (x < 0 || x >= width || y < 0 || y > height) return true;
        // Check collision with itself
        for (var i = 1, len = this.x.length; i < len; i++) {
          if (x === this.x[i] && y === this.y[i]) return true;
        }
        return false;
      },
    };
  }
  function createScores() {
    var best = 0,
      score;
    return {
      start: function () {
        score = 0;
        actualScore.innerText = "0";
      },
      incr: function (n) {
        score += n;
        actualScore.innerText = "" + score;
      },
      stop: function () {
        if (score > best) {
          best = score;
          bestScore.innerText = "" + best;
        }
      },
    };
  }

  renderer.camera.position = [0, 0, 500];
  renderer.render();
})(debug);
