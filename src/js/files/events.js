import { addMoney } from './functions.js';
import { initStartData, writeCurrentBet } from './script.js';
import { startGame, resetGame, stopAnimation, config_game } from './aviator.js';

import { startData } from './startData.js';


// Объявляем слушатель событий "клик"

document.addEventListener('click', (e) => {
	initStartData();

	let targetElement = e.target;

	const wrapper = document.querySelector('.wrapper');

	const money = +sessionStorage.getItem('money');
	const currentBet = +sessionStorage.getItem('current-bet');

	if (targetElement.closest('[data-btn="privacy"]')) {
		location.href = 'index.html';
	}

	if (targetElement.closest('.preloader__button')) {
		location.href = 'main.html';
	}

	if (targetElement.closest('[data-btn="aviator"]')) {
		wrapper.classList.add('_aviator');
	}

	if (targetElement.closest('[data-btn="avia-home"]')) {
		wrapper.classList.remove('_aviator');

		// reset game
		if (config_game.state !== 1) {
			stopAnimation();

			setTimeout(() => {
				resetGame();
			}, 2000);
		}
	}

	//aviator

	if (targetElement.closest('[data-btn="bet-down"]') && currentBet > startData.countBet) {
		sessionStorage.setItem('current-bet', currentBet - startData.countBet);
		writeCurrentBet();
	}

	if (targetElement.closest('[data-btn="bet-up"]') && money > currentBet + startData.countBet && currentBet < startData.maxBet) {
		sessionStorage.setItem('current-bet', currentBet + startData.countBet);
		writeCurrentBet();
	}

	if (targetElement.closest('[data-btn="aviator-start"]') && config_game.state === 2) {
		stopAnimation();
		config_game.state = 3;
		document.querySelector('[data-btn="aviator-start"]').classList.add('_hold');
		setTimeout(() => {
			resetGame();
		}, 2000);
		addMoney(config_game.current_win, '.score', 1000, 2000);
	}

	if (targetElement.closest('[data-btn="aviator-start"]') && config_game.state === 1) {
		startGame();
	}

})
