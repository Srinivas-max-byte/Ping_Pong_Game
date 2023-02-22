// Initial velocity and increse in velocity for each rendered frame is declared as constant.
var loser = 0;
var rodPosition;
var turn = 0;
var difficulty = 0.002;

class Ball {
  // Constructor for assigning ball object from html to this object.
  constructor(ballElem) {
    this.ballElem = ballElem;
    this.resetBottom();
  }
  // Getter method for retrieving the property 'x' value of ball  object.
  get x() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"));
  }
  // Setter Method for setting the value of var 'x' of ball object.
  set x(value) {
    this.ballElem.style.setProperty("--x", value);
  }
  // Getter method for retrieving the property 'y' value of ball  object.
  get y() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"));
  }
  // Setter Method for setting the value of var 'y' of ball object.
  set y(value) {
    this.ballElem.style.setProperty("--y", value);
  }
  //  For providing information about the size of an ball division element object and its position relative to the viewport.
  rect() {
    return this.ballElem.getBoundingClientRect();
  }
  // If top bar loses reset the ball near top bar in center with new direction and velocity 0.
  resetTop() {
    this.x = 50;
    this.y = 6;
    this.direction = { y: 0 };
    while (this.direction.y <= 0.3 || this.direction.y >= 0.9) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = 0;
    difficulty = 0;
  }
  // If top bar loses reset the ball near bottom bar in center with new direction and velocity 0.
  resetBottom() {
    this.x = 50;
    this.y = 94;
    this.direction = { y: 0 };
    while (this.direction.y >= -0.3 || this.direction.y <= -0.9) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = 0;
    difficulty = 0;
  }

  // For updating the ball position in every 1ms as called upon
  update(rod1, rod2) {
    // Setting initial velocity of ball along with changing position in that direction.
    this.velocity = 0.5;
    this.x += this.direction.x * this.velocity * difficulty;
    this.y += this.direction.y * this.velocity * difficulty;
    // Increasing the difficulty by increasing speed gradually.
    difficulty += 0.0005;
    // Dimensions of ball stored in "rect".
    let rect = this.rect();
    // Change direction of x if hitting the side walls.
    if (rect.left <= 0 || rect.right >= window.innerWidth) {
      this.direction.x *= -1;
    }
    // Using Turn variable for avoiding multiple checks for collision of rod and ball
    // i.e if top rod collides then turn for checking collision is of bottom rod
    if (turn === 0 && isCollision(rod1.rect(), rect)) {
      this.direction.y *= -1;
      rod1.score += 10;
      turn = 1;
    }

    if (turn === 1 && isCollision(rod2.rect(), rect)) {
      this.direction.y *= -1;
      rod2.score += 10;
      turn = 0;
    }
  }
}
// Function for generating random number
function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}
// Function for checking collision
function isCollision(rod, ball) {
  return (
    rod.bottom >= ball.top &&
    rod.top <= ball.bottom &&
    rod.left <= ball.right &&
    rod.right >= ball.left
  );
}

// ________________________________________________________________________
// Paddle class represents both rods in UI.
class Paddle {
  constructor(paddleElem) {
    this.paddleElem = paddleElem;
    this.score = 0;
    this.reset();
  }

  get position() {
    return parseFloat(
      getComputedStyle(this.paddleElem).getPropertyValue("--position")
    );
  }

  set position(value) {
    this.paddleElem.style.setProperty("--position", value);
  }

  rect() {
    return this.paddleElem.getBoundingClientRect();
  }

  reset() {
    this.position = 50;
    this.score = 0;
  }
}
// Declaring Objects for accessing the properties.
const ball = new Ball(document.getElementById("ball"));
const rod1 = new Paddle(document.getElementById("rod-one"));
const rod2 = new Paddle(document.getElementById("rod-two"));
// Starting point of game.
function startGame() {
  show_score();
  const myInterval = setInterval(function () {
    ball.update(rod1, rod2);
    if (isLose()) {
      handleLose();
      clearInterval(myInterval);
    }
  }, 1);
}
// For showing the score when one loses.
function show_score() {
  if (localStorage.getItem("first") == null) {
    localStorage.setItem("first", 0);
    localStorage.setItem("second", 0);
    window.alert("This is your first time");
  } else {
    window.alert(
      "Rod 1 has a maximum score of " +
        localStorage.getItem("first").toString() +
        "\n" +
        "Rod 2 has a maximum score of " +
        localStorage.getItem("second")
    );
  }
}
// For checking if the ball went off-bounds of screen without hitting rods.
function isLose() {
  const rect = ball.rect();
  if (rect.top >= window.innerHeight) {
    loser = 1;
    return true;
  } else if (rect.top <= 0) {
    loser = 0;
    return true;
  }
  return false;
}
// On ball going off bounds we need to check if highscore is made and store in local storage.
function handleLose() {
  let highScoreOne = Number(localStorage.getItem("first"));
  let highScoreTwo = Number(localStorage.getItem("second"));
  if (highScoreOne < rod1.score) {
    localStorage.setItem("first", rod1.score);
  }
  if (highScoreTwo < rod2.score) {
    localStorage.setItem("second", rod2.score);
  }
  if (loser == 0) {
    alert("Winner is Rod Two with score " + rod2.score);
    ball.resetTop();
    turn = 1;
  } else {
    alert("Winner is Rod One with score " + rod1.score);
    turn = 0;
    ball.resetBottom();
  }
  // Resetting rods to center position with their score = 0.
  rod1.reset();
  rod2.reset();
}

// Adding event Listener for moving left or right both rods.
window.addEventListener("keydown", (e) => {
  let code = e.keyCode;
  rodPosition = rod1.position;
  if (code == 65) {
    if (rodPosition <= 9) {
      return;
    }
    rodPosition -= 10;
    rod1.position = rodPosition;
    rod2.position = rodPosition;
  } else if (code == 68) {
    if (rodPosition >= 91) {
      return;
    }
    rodPosition += 10;
    rod1.position = rodPosition;
    rod2.position = rodPosition;
  }
});
// Starting Game on pressin key "ENTER".
window.addEventListener("keypress", (e) => {
  let code = e.keyCode;
  if (code == 13) {
    startGame();
  }
});
