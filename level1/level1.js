// canvas and context
var canvas = null;
var ctx = null;

// window variable
var width = 0;
var height = 0;

// game variable
var roverSize = 10;
var roverLength = 3;
var roverSteps = 0;

var gameCompleted = false;

// game timer variable
var updateSpeed = 0;
var MAX_UPDATE_SPEED = 15;			

var countdown = 500;
var COUNTDOWN_UNIT = 50;
var DEFAULT_COUNTDOWN = 500;

var FLASHING_COUNTDOWN = 800;
var blink = false;

var timer = null;
var flashingTimer = null;

// rover variable
var heading = 2;
var HEADING_UP = 2;
var HEADING_RIGHT = 6;
var HEADING_DOWN = 9;
var HEADING_LEFT = 4;

var roverLocation = null;
var oldroverLocation = null;
var roverMoved = new Boolean();

var endPoint = null;
var endPointSize = null;

function init() {
	canvas = document.getElementById('canvas');

	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	canvasWidth -= 30;
	canvasHeight -= 110;

	canvasWidth -= canvasWidth % roverSize;
	canvasHeight -= canvasHeight % roverSize;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	width = canvas.width;
	height = canvas.height;

	roverLocation = new Array(roverLength);

	for (var i = 0; i < roverLength; i++) {
		roverLocation[i] = new Array(2);
		if (i == 0) {
			roverLocation[i][0] = (roverLength - 3) * roverSize;
			roverLocation[i][1] = height - (2 * roverSize);
		} else {
			roverLocation[i][0] = roverLocation[i-1][0];
			roverLocation[i][1] = roverLocation[i-1][1] + roverSize;;
		}

	}

	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		generatePoints();
		drawStartingAndEndingPoint();
		draw();
	}
}

function generatePoints() {
	endPointSize = new Array(2);
	endPointSize[0] = roverSize * 5;
	endPointSize[1] = roverSize * 5;

	endPoint = new Array(2);
	endPoint[0] = width;
	endPoint[1] = endPointSize[1];

	endPoint[0] -= endPointSize[0];
	endPoint[1] -= endPointSize[1];
}

function drawStartingAndEndingPoint() {
	ctx.fillStyle = "rgb(0,255,0)";
	ctx.fillRect(endPoint[0], endPoint[1], endPointSize[0], endPointSize[1]);
}

function startTimer() {
	if (gameCompleted == false) {
		timer = setTimeout("draw()", countdown);
	}
}

function draw() {
	clearRect();
	update();
	calculateLocation();
	drawRect();
	startTimer();
	roverSteps++;
	updateGameScore();
}

function clearRect() {
	for (var i = 0; i < roverLength; i++) {
		ctx.clearRect(roverLocation[i][0], roverLocation[i][1], roverSize, roverSize);
	}
}

function calculateLocation() {
	oldroverLocation = roverLocation;
	roverLocation = new Array(roverLength);

	roverLocation[0] = new Array(2);
	roverLocation[0][0] = oldroverLocation[0][0];
	roverLocation[0][1] = oldroverLocation[0][1];

	if (heading == HEADING_UP) {
		roverLocation[0][1] = roverLocation[0][1] - roverSize;
	} else if (heading == HEADING_RIGHT) {
		roverLocation[0][0] = roverLocation[0][0] + roverSize;
	} else if (heading == HEADING_DOWN) {
		roverLocation[0][1] = roverLocation[0][1] + roverSize;
	} else if (heading == HEADING_LEFT) {
		roverLocation[0][0] = roverLocation[0][0] - roverSize;
	}

	for (var i = 1; i < roverLength; i++) {
		roverLocation[i] = oldroverLocation[i-1];
	}

	detectIfReachedEndPoint();

	// filter out of bound
	for (var i = 0; i < roverLength; i++) {
		if (roverLocation[i][0] + roverSize > width) {
			roverLocation[i][0] = 0;
		}
		if (roverLocation[i][0] < 0) {
			roverLocation[i][0] = width - roverSize;
			/* to compensate for the size of the rectangle
			if set to width, it will be not in the canvas, but outside */
		}

		if (roverLocation[i][1] + roverSize > height ) {
			roverLocation[i][1] = 0;
		}
		if (roverLocation[i][1] < 0) {
			roverLocation[i][1] = height - roverSize;
		}
	}

	roverMoved = true;
}

function detectIfReachedEndPoint() {
	var fulfilWinningCondition = true;
	for (var i = 0; i < roverLength; i++) {
		var block = roverLocation[i];
		fulfilWinningCondition &= blockWithinEndPoint(block);
	}

	if (fulfilWinningCondition) {
		// completed
		requestRestartGame();
		flash();
	}	
}

function blockWithinEndPoint(block) {
	// end point
	var startWidth = endPoint[0];
	var endWidth = endPoint[0] + endPointSize[0];

	var startHeight = endPoint[1];
	var endHeight = endPoint[1] + endPointSize[1];

	// for each rover block
	var blockStartWidth = block[0];
	var blockStartHeight = block[1];

	var blockEndWidth = blockStartWidth + roverSize;
	var blockEndHeight = blockStartHeight + roverSize;

	var inWidth = blockStartWidth >= startWidth && blockEndWidth <= endWidth;
	var inHeight = blockStartHeight >= startHeight && blockEndHeight <= endHeight;

	// result
	return inWidth && inHeight;
}

function drawRect() {
	ctx.fillStyle = "rgb(255,0,0)";
	for (var i = 0; i < roverLength; i++) {
		ctx.fillRect(roverLocation[i][0], roverLocation[i][1], roverSize, roverSize);
	}
}

function updateGameScore() {
	document.getElementById('steps').innerHTML = roverSteps;
}

function startFlashingTimer() {
	flashingTimer = setTimeout("flash()", FLASHING_COUNTDOWN);
}

function flash() {
	if (blink) {
		clearRect();
	} else {
		drawRect();	
	}
	blink = !blink;
	startFlashingTimer();
}

function keyPressed(e) {
	var key = e.keyCode;
	if (key == 82) {
		// [R]estart
		requestRestartGame();
	} else if (key == 189) {
		// -
		decreaseUpdateSpeed();
		} else if (key == 187) {
		// +
		increaseUpdateSpeed();
	} else {

	}
}

function moveUp() {
	changeDirection(HEADING_UP);
}

function moveDown() {
	changeDirection(HEADING_DOWN);
}

function moveLeft() {
	changeDirection(HEADING_LEFT);
}

function moveRight() {
	changeDirection(HEADING_RIGHT);
}

function changeDirection(newHeading) {
	if (roverMoved) {
		if (newHeading == HEADING_UP) {
			if (heading != HEADING_DOWN) {
				heading = HEADING_UP;
			}
		} else if (newHeading == HEADING_RIGHT) {
			if (heading != HEADING_LEFT) {
				heading = HEADING_RIGHT;
			}
		} else if (newHeading == HEADING_DOWN) {
			if (heading != HEADING_UP) {
				heading = HEADING_DOWN;
			}
		} else if (newHeading == HEADING_LEFT) {
			if (heading != HEADING_RIGHT) {
				heading = HEADING_LEFT;
			}
		}
		roverMoved = false;
	}
}

function increaseUpdateSpeed() {
	// updateSpeed 0 (500ms) ~ 9 (50ms)
	if (updateSpeed < MAX_UPDATE_SPEED - 1) {
		updateSpeed++;
	}
	updateGameUpdateSpeed();
}

function decreaseUpdateSpeed() {
	if (updateSpeed > 0) {
		updateSpeed--;
	}
	updateGameUpdateSpeed();
}

function updateGameUpdateSpeed() {
	countdown = DEFAULT_COUNTDOWN - (updateSpeed * COUNTDOWN_UNIT);
	document.getElementById('speed').innerHTML = updateSpeed + 1;
}

function requestRestartGame() {
	gameCompleted = true;
}