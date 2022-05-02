import Wordle from './Wordle.js';


function getTargetElement(identifier) {
	return document.querySelector(
		`${identifier[0]==='#' ?identifier :'.'+identifier}`);
}

function handleToggleTrigger(e) {
	const toggleType = e.currentTarget.dataset.toggle;
	const targetIdentifier = e.currentTarget.dataset.target;
	let targetElement = getTargetElement(targetIdentifier);

	if (e.currentTarget.getAttribute('arial-expanded') === 'false') {
		if (toggleType === 'modal' || 'offcanvas') {
			targetElement.classList.add('show')
			e.currentTarget.setAttribute('arial-expanded', 'true')
		}
	} else {
		if (toggleType === 'modal' || 'offcanvas') {
			targetElement.classList.remove('show')
			e.currentTarget.setAttribute('arial-expanded', 'false')
		}
	}
}

function handleToggleDismiss(e) {
	if (e.target !== e.currentTarget) return

	const toggleType = e.currentTarget.dataset.dismiss;
	const targetIdentifier = e.currentTarget.dataset.target;
	let targetElement = getTargetElement(targetIdentifier);

	if (toggleType === 'modal' || 'offcanvas') {
		targetElement.classList.remove('show')
		document.querySelectorAll(`[arial-controls="${targetIdentifier}"]`)
			.forEach(toggle => toggle.setAttribute('arial-expanded', 'false'));
	}
}

function handleThemeToggle(e) {
	const toggleType = e.currentTarget.dataset.toggle;
	const targetIdentifier = e.currentTarget.dataset.target;
	let targetElement = getTargetElement(targetIdentifier);

	if (e.currentTarget.getAttribute('arial-expanded') === 'false') {
		targetElement.setAttribute('data-color-theme',
			 targetElement.dataset.jsDefaultTheme);
		e.currentTarget.setAttribute('arial-expanded', 'true');
	} else {
		targetElement.setAttribute('data-color-theme',
			 e.currentTarget.dataset.theme);
		e.currentTarget.setAttribute('arial-expanded', 'false');
	}
}

const triggerToggles = document.querySelectorAll('[data-toggle]');
triggerToggles.forEach(toggle => 
	toggle.addEventListener('click', handleToggleTrigger));

const dismissToggles = document.querySelectorAll('[data-dismiss]');
dismissToggles.forEach(toggle => 
	toggle.addEventListener('click', handleToggleDismiss));

const colorThemeToggles = document.querySelectorAll(`[data-toggle='color-theme']`)
colorThemeToggles.forEach(toggle => 
	toggle.addEventListener('input', handleThemeToggle));

// ============================================================
// ============================================================

function handleNavMenuItem(e) {
	const navbarNav = e.target.closest('.navbar__nav');
	const navbarNavCloseBtn = navbarNav.querySelector(
		'.navbar__nav-header [data-dismiss]');
	navbarNavCloseBtn.click();
}

const navMenuItems = document.querySelectorAll('.navbar__menu-item')
navMenuItems.forEach(navItem => 
	navItem.addEventListener('click', handleNavMenuItem));

// ============================================================
// ============================================================

function handleSectionKeyNavigations(e) {
	// escape key
	if (e.keyCode === 27) {
		const sectionDismissToggle = visibleSectionElement.querySelector(`
		[data-dismiss][data-target=${visibleSectionElement.getAttribute('id')}`);
		sectionDismissToggle.click();
	}
}

function handleWordleSections(sections, observer) {
	sections.forEach(section => {
		if (section.isIntersecting) {
			if (section.target.matches('section')) {
				visibleSectionElement = section.target;
			}
		}
	})
}

function handleWordleSectionsClassMutated(sections, observer) {
	sections.forEach(section => {
		if (section.type === 'attributes'
			&& section.attributeName === 'class'
			&& section.target.matches('.show, .active')
		) visibleSectionElement = section.target;
		else visibleSectionElement = wordleSectionElements[0];
	})
}


const navbarNav = document.querySelector('.navbar__nav');
const wordleGameSection = document.querySelector('#wordle-game');
const wordleSectionSelectors = [
		'wordle-game', 'wordle-game__stats', 'settings', 'how-to-play'];
const wordleSectionElements = wordleSectionSelectors.map(
		section => document.getElementById(section));

let visibleSectionElement = wordleSectionElements[0];

const wordleSectionsScrollObserver = new IntersectionObserver(handleWordleSections, {});
wordleSectionsScrollObserver.observe(wordleGameSection);

const observeClassOption = { attributes: true };
const wordleSectionClassObserver = new MutationObserver(handleWordleSectionsClassMutated);
wordleSectionClassObserver.observe(navbarNav, observeClassOption);
wordleSectionElements.forEach(section => 
	wordleSectionClassObserver.observe(section, observeClassOption));

// ============================================================
// ============================================================

const WORDLE_TILE_STATE = {
	reveal: 'revealWordState',
	guessing: 'guessing',
	guessingError: 'notifyGuessError',
	guessWordWon: 'notifyGuessWon'
}

const WORDLE_TILE_STATE_ANIMATION = {
	reveal: 'showLetterState',
	guessing: 'guessingLetter',
	guessingError: 'shakeLetter',
	guessWordWon: 'bubbleLetter'
}

function handleWordleGameKeyNavigation(e) {
	if (wordleGameLogic.hasGuessedWord 
		|| wordleGameLogic.remainingLives === 0) return;

	// enter key
	if (e.keyCode === 13) handleRecentGuess();
	// backspace key
	if (e.keyCode === 8) handleBackspaceGuessing();
	// a-z keys
	if (e.keyCode>64 && e.keyCode<91) {
		const alphabet = e.code.slice(3);
		handleBoardGuessInsertion(alphabet);
	}
}

function handleWordleKeyboardInput(e) {
	if (wordleGameLogic.hasGuessedWord 
		|| wordleGameLogic.remainingLives === 0) return;

	const clickedKey = e.target.dataset.keyboardKey;
	if (clickedKey === 'enter') handleRecentGuess();
	if (clickedKey === 'backspace') handleBackspaceGuessing();
	if (clickedKey.match(/^[a-z]$/)) handleBoardGuessInsertion(clickedKey);
}

function handleBoardGuessInsertion(value) {
	if (currentLetterIndex > wordleGameLogic.wordToGuess.length - 1) {
		shakeGuessWord(wordleGameLogic.rowGuessingAt);
		return;
	}

	let currentLetter = wordleBoard.children[wordleGameLogic.rowGuessingAt]
						.children[currentLetterIndex];
	currentLetter.innerText = value;
	currentLetter.setAttribute('data-letter-state', WORDLE_TILE_STATE.guessing);
	currentLetter.style.animationDuration = 'var(--guessing-duration)';
	currentLetter.classList.add(WORDLE_TILE_STATE.guessing);
	currentLetterIndex++;
}

function handleBackspaceGuessing() {
	if (currentLetterIndex<1 || wordleGameLogic.hasGuessedWord) {
		shakeGuessWord(wordleGameLogic.rowGuessingAt);
		return;
	};

	currentLetterIndex--;
	let currentLetter = wordleBoard.children[wordleGameLogic.rowGuessingAt]
						.children[currentLetterIndex];
	currentLetter.innerText = '';
	currentLetter.removeAttribute('data-letter-state');
	currentLetter.classList.remove(WORDLE_TILE_STATE.guessing);
}

function getDelayValue(duration, delay) {
	let operator = delay[0];
	let durationValue = parseInt(duration);
	let delayValue = parseInt(delay.slice(1, -2));
	if (operator === '+') return durationValue + delayValue;
	if (operator === '-') return durationValue - delayValue;
	return 0;
}

function showGameplayOutcome(msg) {
	const wordleStatisticsProcessingTimeMs = 600;
	wordleOutcomeDisplay.innerText = msg;
	wordleOutcomeDisplay.classList.add('show');
	wordleOutcomeDisplay.addEventListener('transitionend', () => {
		if (!wordleOutcomeDisplay.classList.contains('show')) return;

		// message still displaying
		const wordleStatsToggle = document.querySelector(
			`[data-target="wordle-game__stats"]`);
		setTimeout(() => {
			if (wordleStatsToggle.getAttribute('arial-expanded') === 'false')
				wordleStatsToggle.click();
		}, wordleStatisticsProcessingTimeMs);
	});
}

function updateBoardGameplay() {
	let lastFlippedTile = null;

	const flipDuration = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-fliping-duration-ms').slice(0, -2);
	let flipDelayDifference = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-fliping-interval-ms').trim();
	const bubbleDuration = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-bubble-duration-ms').slice(0, -2);
	let bubbleDelayDifference = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-bubble-interval-ms').trim();

	wordleGameLogic.board.forEach((word, wordIndex) => {
		let wordleWordRow = Array.from(wordleBoard.children[wordIndex].children);

		word.forEach((letter, letterIndex) => {
			let wordleLetterCol = wordleWordRow[letterIndex];

			wordleLetterCol.innerText = letter.value || "";
			letter.state && wordleLetterCol.setAttribute('data-letter-state', letter.state);
			wordleLetterCol.style.setProperty('--flip-delay',
				`${getDelayValue(flipDuration, flipDelayDifference) * letterIndex}ms`);
			wordleLetterCol.style.setProperty('--bubble-delay',
				`${getDelayValue(bubbleDuration, bubbleDelayDifference) * letterIndex}ms`);

			// flip after tile update
			if (wordleLetterCol.matches('[data-letter-state]')) {
				wordleLetterCol.style.animationDuration = 'var(--tile-fliping-duration-ms)';
				wordleLetterCol.classList.add(WORDLE_TILE_STATE.reveal);
			}
		})

		if (wordleGameLogic.hasGuessedWord
			&& wordleGameLogic.hasGuessedWordRow === wordIndex) 
		{
			lastFlippedTile = wordleWordRow.at(-1);
		}

		if (wordleGameLogic.remainingLives === 0 
			&& wordIndex === wordleGameLogic.board.length -1) 
		{
			lastFlippedTile = wordleWordRow.at(-1);
		}
	})

	lastFlippedTile 
	&& lastFlippedTile.addEventListener('animationend', (e) => {
		if (wordleGameLogic.hasGuessedWord) {
			// animate wining tiles after flipping
			if (e.animationName === WORDLE_TILE_STATE_ANIMATION.reveal) {
				Array
				.from(wordleBoard.children[wordleGameLogic.hasGuessedWordRow].children)
				.forEach((letter, letterIndex) => {
					letter.style.animationDuration = 'var(--tile-bubble-duration-ms)';
					letter.classList.add(WORDLE_TILE_STATE.guessWordWon);
				})
			}

			// display outcome if won
			if (e.animationName === WORDLE_TILE_STATE_ANIMATION.guessWordWon) {
				showGameplayOutcome('You Win!')
			}	
		}

		if (wordleGameLogic.remainingLives === 0) {
			if (e.animationName === WORDLE_TILE_STATE_ANIMATION.reveal) {
				showGameplayOutcome(wordleGameLogic.wordToGuess.toUpperCase());
			}
		}
	})
}

function updateKeyboardGuessedLetters() {
	wordleGameLogic.guessedLetters.forEach(letter => {
		wordleKeyboard.querySelector(
			`[data-keyboard-key="${letter.value}"]`)
			.setAttribute('data-letter-state', letter.state);
	});
}

function shakeGuessWord(boardRow) {
	const guessLetters = Array
			.from(wordleBoard.children[boardRow].children);

	guessLetters.forEach(letter => {
		letter.style.animationDuration = 'var(--shaking-duration)';
		letter.classList.add(WORDLE_TILE_STATE.guessingError);
		// return to prev animation end state
		letter.addEventListener('animationend', e => {
			if (e.animationName === WORDLE_TILE_STATE_ANIMATION.guessingError){
				letter.classList.remove(WORDLE_TILE_STATE.guessingError);
			}
		})
	})
}

function flashWordleMessage(message) {
	const displayTimeMs = 1200;
	let msgItem = document
		.querySelector("#wordle-game__flash-msgs-item-template")
		.content.cloneNode(true)
		.querySelector('.wordle-game__flash-msgs-item');
	msgItem.querySelector('.text').innerText = message;
	wordleFlashMsg.prepend(msgItem);
	setTimeout(() => {
		msgItem.classList.add('hide')
		msgItem.addEventListener('transitionend', () => msgItem.remove());
	}, displayTimeMs)
}

function handleRecentGuess() {
	const wordInput = Array.from(wordleBoard
					.children[wordleGameLogic.rowGuessingAt].children);
	const guess = wordInput.reduce(
		(guess, letter) => guess += letter.innerText.toLowerCase(), '')

	wordleGameLogic.validateGuess(guess, (response) => {
		if (response === 'valid') {
			wordleGameLogic.handleGuess(guess);
			handleWordleGameplay();
			updatePlayerStatistics();
		} else if (response === 'short' || response === 'long') {
			flashWordleMessage('Word too short');
		} else if (response === 'has guessed') {
			flashWordleMessage('Has guessed word');
		} else if (response === 'invalid') {
			flashWordleMessage('Word not accepted')
		}
	})
}

// or rebuild the page/section - me too lazy
function clearPreviousGameplay() {
	wordleOutcomeDisplay.classList.remove('show');
	wordleKeyboardKeys.forEach(key => key.removeAttribute('data-letter-state'))
	Array.from(wordleBoard.children).forEach(word => {
		Array.from(word.children).forEach(letter => {
			letter.innerText = '';
			letter.removeAttribute('style')
			letter.removeAttribute('data-letter-state')
			for (let key in WORDLE_TILE_STATE) {
				letter.classList.remove(WORDLE_TILE_STATE[key])
			}
		})
	})
}

// ============================================================
// ============================================================

function handleAlterBtn(e) {
	e.preventDefault();
	const clickedOn = e.target.dataset.forSession;
	const closeSectionBtn = document.querySelector(
			'.wordle-game__stats-close')
	// play again
	if (clickedOn === 'play-again') {
		wordleGameLogic.newGame();
		clearPreviousGameplay();
		handleWordleGameplay();
		closeSectionBtn.click();
	} else {
		console.log('sharing not implemented')
	}
}

function handleGameAlterAbility() {
	// win or loose
	if (wordleGameLogic.hasGuessedWord 
		|| wordleGameLogic.remainingLives === 0) 
	{
		wordleGameAlterBlock.classList.remove('display-none');
		wordleGameAlterBtns.forEach(btn => 
			btn.addEventListener('click', handleAlterBtn));
	} else {
		wordleGameAlterBlock.classList.add('display-none')
		wordleGameAlterBtns.forEach(btn => 
			btn.removeEventListener('click', handleAlterBtn));
	}
}

const wordleGameAlterBlock = document.querySelector('.wordle-game__session');
const wordleGameAlterBtns = document.querySelectorAll('.wordle-game__session-btn');

// ============================================================
// ============================================================

let PLAYER_STATISTICS_DATA = {};
const PLAYER_STATISTICS_DATA_KEY = 'oghenetefa-wordle-clone-statistics-data';

function savePlayerStatistics() {
	localStorage.setItem(PLAYER_STATISTICS_DATA_KEY, 
		JSON.stringify({...PLAYER_STATISTICS_DATA}));
}

function loadInPlayerStatistics() {
	const data = JSON.parse(
		localStorage.getItem(PLAYER_STATISTICS_DATA_KEY));

	if (data) {
		PLAYER_STATISTICS_DATA.played = parseInt(data.played);
		PLAYER_STATISTICS_DATA.wins = parseInt(data.wins);
		PLAYER_STATISTICS_DATA.winingStreak = parseInt(data.winingStreak);
		PLAYER_STATISTICS_DATA.maxWiningStreak = parseInt(data.maxWiningStreak);
	} else {
		PLAYER_STATISTICS_DATA.played = 0;
		PLAYER_STATISTICS_DATA.wins = 0;
		PLAYER_STATISTICS_DATA.winingStreak = 0;
		PLAYER_STATISTICS_DATA.maxWiningStreak = 0;
	}
}

function updatePlayerStatistics() {
	// win or loose
	if (wordleGameLogic.hasGuessedWord 
		|| wordleGameLogic.remainingLives === 0) 
	{
		PLAYER_STATISTICS_DATA.played += 1;
	}

	// win
	if (wordleGameLogic.hasGuessedWord)
		PLAYER_STATISTICS_DATA.wins += 1;

	// on a wining streak
	if (PLAYER_STATISTICS_DATA.wins > 1)
		PLAYER_STATISTICS_DATA.winingStreak += 1;

	// lost wining streak
	if (!wordleGameLogic.hasGuessedWord 
		&& wordleGameLogic.remainingLives === 0
		&& PLAYER_STATISTICS_DATA.winingStreak > 0) 
	{
		PLAYER_STATISTICS_DATA.wins = 0;
		PLAYER_STATISTICS_DATA.winingStreak = 0;
	}

	if (PLAYER_STATISTICS_DATA.winingStreak 
		> PLAYER_STATISTICS_DATA.maxWiningStreak) 
	{
		PLAYER_STATISTICS_DATA
		.maxWiningStreak = PLAYER_STATISTICS_DATA.winingStreak
	}
	
	updateWordleStatsView();
	savePlayerStatistics();
}

function updateWordleStatsView() {
	wordleStats.querySelector('#wordle-stats-played .value')
		.innerText = PLAYER_STATISTICS_DATA.played;
	wordleStats.querySelector('#wordle-stats-wins .value')
		.innerText = PLAYER_STATISTICS_DATA.wins;
	wordleStats.querySelector('#wordle-stats-wining-streak .value')
		.innerText = PLAYER_STATISTICS_DATA.winingStreak;
	wordleStats.querySelector('#wordle-stats-max-wining-streak .value')
		.innerText = PLAYER_STATISTICS_DATA.maxWiningStreak;
}

// ============================================================
// ============================================================

function handleWordleGameplay() {
	console.log('CHEAT', wordleGameLogic.wordToGuess);
	currentLetterIndex = 0;
	updateBoardGameplay();
	updateKeyboardGuessedLetters();
	updateWordleStatsView();
	handleGameAlterAbility();
}

function clearUserInformation() {
	localStorage.removeItem(PLAYER_STATISTICS_DATA_KEY);
	wordleGameLogic.clearStoredData();
}

let currentLetterIndex = 0;
const wordleGameLogic = new Wordle();
const startNewWordleGameLogic = setInterval(() => {
	let currentTime = new Date().toLocaleTimeString("en-US", 
		{ houe12: false });
	let currentHour = Number(currentTime.split(":")[0]);
	if (currentHour<1) wordleGameLogic.newGame();
}, 1000)

const wordleStats = document.querySelector('.wordle-game__stats');
const wordleFlashMsg = document.querySelector('.wordle-game__flash-msgs');
const wordleOutcomeDisplay = document.querySelector('.wordle-game__outcome');
const wordleBoard = document.querySelector('.wordle-game__board');
const wordleKeyboard = document.querySelector('.wordle-game__keyboard');
const wordleKeyboardKeys = document.querySelectorAll('.wordle-game__keyboard-key');
wordleKeyboardKeys.forEach(key =>  key.addEventListener('click', handleWordleKeyboardInput));

// ============================================================
// ============================================================

document.addEventListener('keydown', e => {
	wordleSectionElements.forEach((element, index) => {
		if (visibleSectionElement !== element) return
		if (index === 0) handleWordleGameKeyNavigation(e);
		else if (index > 0) handleSectionKeyNavigations(e)
	})
})

document.addEventListener('DOMContentLoaded', () => {
	loadInPlayerStatistics();
	handleWordleGameplay();

	// swith on toggle for respective theme
	const currentTheme = document.querySelector('body')
		.getAttribute('data-color-theme');
	const currentThemeToggle = document.querySelector(
		`[data-toggle="color-theme"][data-theme="${currentTheme}"]`);
	currentThemeToggle && currentThemeToggle.click();
})
