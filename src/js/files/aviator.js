import { deleteMoney, getRandom, getRandom_2 } from './functions.js';
import { writeCurrentBet } from './script.js';
import { startData } from './startData.js';


export const config_game = {
	state: 1, // (1 - готов начать игру, 2 - летим, 3 - проиграли)
	height_field: document.querySelector('.game') ? document.querySelector('.field__body').clientHeight : false,

	current_win: 0,

	current_coeff: 0,
	start_coeff: 0,
	coeff_up: 0.01,

	startX: 2,
	startBottom: 2,
	startRotate: 0,

	speed_up: 0.2,
	speed_right: 0.4,

	timerId: false,
	timerCoeff: false,
	timerDraw: false
}

const config_canvas = {
	width: 0,
	height: 0,
	color_line: '0,0,0',
	xOffset: 20,
	yOffset: -140 // 140
}

function setCoordCanvasLineForIpad() {
	if (innerHeight > 700 && innerWidth > 700) {
		config_canvas.yOffset = -220;
	} else {
		if (config_canvas.yOffset !== -140) config_canvas.yOffset = -140;
	}
}

const window_height = document.documentElement.clientHeight;
const button = document.querySelector('[data-btn="aviator-start"]');
const betBox = document.querySelector('.game .block-bet');
const autoButtons = document.querySelector('.game .footer-avia__buttons');

const canvas = document.querySelector('.ctx');
const block = document.querySelector('.field__body');

if (document.querySelector('.game')) {
	setCoordCanvasLineForIpad();
	setCanvas();
}

export function startGame() {
	compareSizesFieldCanvas();

	config_game.state = 2;
	generateCoeff();

	deleteMoney(+sessionStorage.getItem('current-bet'), '.score');

	generateStartSpeed();

	moovePlayer();
	intervalCoeff();

	// Записываем в кнопку bet слово cash
	writeTextBtnBet();

	button.classList.add('_cash');
	betBox.classList.add('_hold');
}

function generateCoeff() {
	let state = getRandom(1, 10);
	if (state > 1 && state <= 3) {
		config_game.current_coeff = getRandom_2(1.1, 2);
	} else if (state > 3 && state <= 7) {
		config_game.current_coeff = getRandom_2(2, 5);
	} else if (state > 7) {
		config_game.current_coeff = getRandom_2(5, 10);
	}
}

function generateStartSpeed() {
	config_game.speed_up = getRandom_2(0.11, 0.25);
	config_game.speed_right = getRandom_2(0.4, 0.7);
}

function moovePlayer() {
	let player = document.querySelector('.field__airplane');

	let bottom = config_game.startBottom;
	let left = config_game.startX;
	let rotate = config_game.startRotate;

	drawCanvas();

	config_game.timerId = setInterval(() => {
		if (left <= 15) {
			bottom += config_game.speed_up;
		} else if (left > 15 && left <= 30) {
			bottom += config_game.speed_up * 1.5;
		} else if (left > 30 && left <= 45) {
			bottom += config_game.speed_up * 2;
		} else if (left > 45) {
			bottom += config_game.speed_up * 4;
		}
		left += config_game.speed_right;

		if (rotate >= -20) {
			rotate -= 0.2;
		}

		player.style.bottom = `${bottom}%`;
		player.style.left = `${left}%`;
		player.style.transform = `rotate(${rotate}deg)`;

		if (left >= 70 || bottom >= 70) {
			clearInterval(config_game.timerId);
			player.style.transition = `all 1s ease 0s`;
			player.style.transform = `rotate(0deg)`;
			document.querySelector('.field__body').classList.add('_fly');
		}
	}, 35);
}

function checkGameOver() {
	if (config_game.start_coeff >= config_game.current_coeff) {
		flyAirplaneWhenLoose();
		config_game.state = 3;
		stopAnimation();
		addLooseColorButtons();
		button.classList.add('_hold');

		setTimeout(() => {
			resetGame();
		}, 2000);
	}
}

function addLooseColorButtons() {
	button.classList.add('_loose');
	if (button.classList.contains('_cash')) button.classList.remove('_cash');
}

function writeTextBtnBet() {
	const btn = document.querySelector('[data-btn="aviator-start"] span');
	if (config_game.state === 2) {
		btn.textContent = 'stop';
	} else btn.textContent = 'Start';
}

function flyAirplaneWhenLoose() {
	let player = document.querySelector('.field__airplane');
	player.style.transition = `all 2s ease 0s`;
	player.style.left = `150%`;
	player.style.bottom = `110%`;
}

//========
//canvas

function setCanvas() {
	setCoordCanvasLineForIpad();

	config_canvas.width = block.clientWidth;
	config_canvas.height = block.clientHeight;

	canvas.setAttribute('width', `${config_canvas.width}px`);
	canvas.setAttribute('height', `${config_canvas.height}px`);
}

function compareSizesFieldCanvas() {
	const blockHeight = block.clientHeight;

	if (blockHeight !== config_canvas.height) setCanvas();

}

function drawCanvas() {
	let pin = document.querySelector('.field__pin');
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	config_game.timerDraw = setInterval(() => {
		if (config_game.state == 3) {
			setTimeout(() => {
				clearInterval(config_game.timerDraw);
			}, 800);
		}
		let coord_x = pin.getBoundingClientRect().left + config_canvas.xOffset;
		let coord_y = pin.getBoundingClientRect().top + config_canvas.yOffset;

		ctx.clearRect(0, 0, config_canvas.width, config_canvas.height);
		createShapeCanvas(coord_x, coord_y, '255,255,255', 10, 15);
		createLineCanvas(coord_x, coord_y, config_canvas.color_line, 0, '4', 10, 15);
	}, 50);
}

function createShapeCanvas(xTop, yTop, color, rx, ry) {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	const gradient = ctx.createLinearGradient(xTop, yTop, 0, config_canvas.height);

	gradient.addColorStop(0, `rgba(${color},0.6)`);
	gradient.addColorStop(1, `rgba(${color},0.1)`);

	ctx.fillStyle = gradient;


	ctx.beginPath();

	// устанавливаем первую точку фигуры
	ctx.moveTo(0, config_canvas.height);

	// вторая точка - кривая линия, повторяющая основную линию

	ctx.quadraticCurveTo(xTop - rx, yTop + ry, xTop, yTop);

	// третья точка - динамическая
	ctx.lineTo(xTop, config_canvas.height);

	ctx.closePath();

	ctx.fill();
}

function createLineCanvas(x, y, color, start_position, lineWidth, rx, ry) {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	ctx.lineWidth = lineWidth;

	let gradient = ctx.createLinearGradient(0, config_canvas.height, x, y);

	gradient.addColorStop(0, `rgba(${color},0.1)`);
	gradient.addColorStop(1, `rgba(${color},1)`);
	ctx.strokeStyle = gradient;

	ctx.setLineDash([13, 13]);
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(start_position, config_canvas.height);
	ctx.quadraticCurveTo(x - rx, y + ry, x, y);
	// третья точка - динамическая
	ctx.lineTo(x, config_canvas.height);

	ctx.closePath();

	ctx.stroke();
}

function clearCanvas() {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, config_canvas.width, config_canvas.height);
}

window.addEventListener('resize', () => {
	setCanvas();
})

//======
function intervalCoeff() {
	config_game.timerCoeff = setInterval(() => {
		config_game.start_coeff += config_game.coeff_up;
		drawCurrentCoeff();
		drawCurrentCount();
		checkGameOver();
	}, 20);
}

function drawCurrentCount() {
	let bet = +sessionStorage.getItem('current-bet');
	config_game.current_win = Math.floor(bet * config_game.start_coeff);
}

function drawCurrentCoeff() {
	document.querySelector('.field__coeff').textContent = `${config_game.start_coeff.toFixed(2)}x`;
}

export function stopAnimation() {
	clearInterval(config_game.timerId);
	clearInterval(config_game.timerCoeff);
	if (document.querySelector('.field__body').classList.contains('_fly'))
		document.querySelector('.field__body').classList.remove('_fly');
}

function removeGameColorButtons() {
	if (button.classList.contains('_loose'))
		button.classList.remove('_loose');

	if (button.classList.contains('_cash'))
		button.classList.remove('_cash');
}

export function resetGame() {
	let player = document.querySelector('.field__airplane');

	config_game.current_win = 0;
	config_game.start_coeff = 0;
	config_game.state = 1;

	player.style.transition = `none`;
	player.style.left = `${config_game.startX}%`;
	player.style.bottom = `${config_game.startBottom}%`;
	player.style.transform = `rotate(${config_game.startRotate}deg)`;

	document.querySelector('.field__coeff').textContent = '0x';

	removeGameColorButtons();

	clearCanvas();

	document.querySelector('.field__body').classList.add('_loader');

	if (document.querySelector('.field__body') && document.querySelector('.field__body').classList.contains('_fly')) {
		document.querySelector('.field__body').classList.remove('_fly');
	}

	writeTextBtnBet();

	setTimeout(() => {
		resetBet();

		document.querySelector('.field__body').classList.remove('_loader');

		if (button && button.classList.contains('_hold')) {
			button.classList.remove('_hold');
		}
		if (autoButtons && autoButtons.classList.contains('_hold')) {
			autoButtons.classList.remove('_hold');
		}

		if (betBox && betBox.classList.contains('_hold')) {
			betBox.classList.remove('_hold');
		}
	}, 5000);
}

function resetBet() {
	sessionStorage.setItem('current-bet', startData.countBet);
	writeCurrentBet();
}
