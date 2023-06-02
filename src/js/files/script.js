import { deleteMoney, checkRemoveAddClass, noMoney, getRandom, addMoney, getRandom_2 } from './functions.js';
import { startData } from './startData.js';

if (sessionStorage.getItem('privacy') && document.querySelector('.preloader')) {
	document.querySelector('.preloader').classList.add('_hide');
}

export function initStartData() {

	if (sessionStorage.getItem('money')) {
		writeScore();
	} else {
		sessionStorage.setItem('money', startData.bank);
		writeScore();
	}

	if (!sessionStorage.getItem('current-bet')) {
		sessionStorage.setItem('current-bet', startData.countBet);
		writeCurrentBet();
	} else {
		writeCurrentBet();
	}

}

function writeScore() {
	if (document.querySelector(startData.nameScore)) {
		document.querySelectorAll(startData.nameScore).forEach(el => {
			el.textContent = sessionStorage.getItem('money');
		})
	}
}

export function writeCurrentBet() {
	const betItem = document.querySelectorAll(startData.nameBetScore);
	if (betItem.length) {
		betItem.forEach(item => {
			item.textContent = sessionStorage.getItem('current-bet');
		})
	}

}

initStartData();


//========================================================================================================================================================
// game-2

export const configFlyGame = {
	state: 1, // 1 - no playing, 2 - play
	startPath: 120,
	path: 120,
	xOffset: 50,
	countOffset: 3,
	isCreatedCoins: false,

	coins: [],
	maxCoins: 4,

	score: 0,
	coeff: 10,

	time: 0,
	timeLimit: 2000,

	infoBlock: document.querySelector('.fly__info'),
	planeBlock: document.querySelector('.fly__plane'),
}
if (configFlyGame.infoBlock) {
	configFlyGame.infoBlock.textContent = `${configFlyGame.startPath} m`;
}

export function startFlyGame() {
	configFlyGame.state = 2;
	animateFly(0);
	if (!configFlyGame.isCreatedCoins) {
		creatCoins();
		configFlyGame.isCreatedCoins = true;
	}

}

export function movePlane(turn) {
	if (turn === 'left' && configFlyGame.xOffset > 0) {
		configFlyGame.xOffset -= configFlyGame.countOffset;
	} else if (turn === 'right' && configFlyGame.xOffset < 100) {
		configFlyGame.xOffset += configFlyGame.countOffset;
	}
	configFlyGame.planeBlock.style.left = `${configFlyGame.xOffset}%`;
}

class Coin {
	constructor() {
		this.x = Math.floor(Math.random() * window.innerWidth * 0.9);
		this.y = 0;
		this.width = 32;
		this.height = 32;

		this.speed = Math.random() * 10 + 1;

		this.isActive = false;

		this.draw();
	}

	draw() {
		this.coin = document.createElement('div');

		this.coin.style.transform = `translate(${this.x}px, 0)`;
		this.coin.setAttribute('class', 'fly__coin');

		document.querySelector('.fly__body').append(this.coin);
	}

	update() {
		if (this.isActive) {
			if (this.y < window.innerHeight - 50) {
				this.y += this.speed;
				this.coin.style.transform = `translate(${this.x}px, ${this.y}px)`;
			} else {
				this.reset();
			}
		}
	}

	reset() {
		this.isActive = false;

		this.x = Math.floor(Math.random() * window.innerWidth);
		this.y = 0;
		this.speed = Math.random() * 10 + 1;

		this.coin.style.transform = `translate(${this.x}px, ${this.y}px)`;

		if (this.coin.classList.contains('_get')) {
			this.coin.classList.remove('_get');
		}
	}

}

function creatCoins() {
	for (let i = 0; i < configFlyGame.maxCoins; i++) {
		configFlyGame.coins.push(new Coin());
	}
}

let lastTime = 0;

function animateFly(timeStamp) {
	const deltaTime = timeStamp - lastTime;
	lastTime = timeStamp;

	addNewFreeCoin(deltaTime);

	const planeInfo = document.querySelector('.fly__plane').getBoundingClientRect();
	const coinsDom = document.querySelectorAll('.fly__coin');

	if (coinsDom.length) {
		coinsDom.forEach(coin => {
			const coinInfo = coin.getBoundingClientRect();
			if (checkCollision(planeInfo, coinInfo) && !coin.classList.contains('_get')) {
				coin.classList.add('_get');
				configFlyGame.score++;
			}
		})
	}

	configFlyGame.coins.forEach(coin => {
		coin.update();
		if (coin.coin.classList.contains('_get')) {

			setTimeout(() => {
				coin.reset();
			}, 500);
		}
	})

	configFlyGame.path -= 0.1;
	configFlyGame.infoBlock.textContent = `${configFlyGame.path.toFixed(2)} m`;

	// Условие работы анимации
	if (configFlyGame.path > 0 && configFlyGame.state === 2) {
		window.requestAnimationFrame(animateFly);
	} else if (configFlyGame.path <= 0 && configFlyGame.state === 2) {

		configFlyGame.coins.forEach(coin => {
			coin.reset();
		})

		let countWin = configFlyGame.coeff * configFlyGame.score;

		showFinalScreen(countWin, 'win');
	}

}

function addNewFreeCoin(deltaTime) {
	if (configFlyGame.time > configFlyGame.timeLimit) {
		configFlyGame.time = 0;

		for (let i = 0; i < configFlyGame.coins.length; i++) {
			if (configFlyGame.coins[i].isActive) continue;
			else if (!configFlyGame.coins[i].isActive) configFlyGame.coins[i].isActive = true;
			break;
		}

	} else {
		configFlyGame.time += deltaTime;
	}
}

function checkCollision(rect1, rect2) {
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	)
}

export function stopFlyGame() {
	configFlyGame.coins.forEach(coin => {
		coin.reset();
	})
	resetDataFlyGame();
}

function resetDataFlyGame() {
	configFlyGame.score = 0;
	configFlyGame.time = 0;
	setTimeout(() => {
		configFlyGame.path = configFlyGame.startPath;

		configFlyGame.infoBlock.textContent = `${configFlyGame.startPath} m`;
	}, 150);

}
export function resetFlyGame() {
	resetDataFlyGame();

	setTimeout(() => {
		startFlyGame();
	}, 250);
}

//========================================================================================================================================================

export function showFinalScreen(count = 0, status = 'lose') {
	const final = document.querySelector('.final');
	const finalCheck = document.querySelector('.final-check');
	const finalTitle = document.querySelector('.final__title');

	if (final.classList.contains('_lose')) final.classList.remove('_lose');

	if (status === 'win') {
		finalTitle.textContent = 'You win!';
		finalCheck.textContent = count;
	} else {
		finalTitle.textContent = 'YOU LOSE :(';

		final.classList.add('_lose');
	}

	setTimeout(() => {
		final.classList.add('_visible');
	}, 500);
}
