import Wordle from './Wordle.js';

function handleToggleTrigger(e) {
	const toggleType = e.currentTarget.dataset.toggle;
	const targetSelector = e.currentTarget.dataset.target;
	let targetElement = document.querySelector(`
		${targetSelector[0] === '#' ? targetSelector : '.' + targetSelector}`)

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
	const toggleType = e.currentTarget.dataset.dismiss;
	const targetSelector = e.currentTarget.dataset.target;
	let targetElement = document.querySelector(`
		${targetSelector[0] === '#' ? targetSelector : '.' + targetSelector}`)

	if (e.target !== e.currentTarget) return

	if (toggleType === 'modal' || 'offcanvas') {
		targetElement.classList.remove('show')
		document.querySelectorAll(`[arial-controls="${targetSelector}"]`)
			.forEach(toggle => toggle.setAttribute('arial-expanded', 'false'));
	}
}

function handleThemeToggle(e) {
	const toggleType = e.currentTarget.dataset.toggle;
	const targetSelector = e.currentTarget.dataset.target;
	let targetElement = document.querySelector(`
		${targetSelector[0] === '#' ?targetSelector :'.'+targetSelector}`);

	if (e.currentTarget.getAttribute('arial-expanded') === 'false') {
		targetElement.setAttribute('data-color-theme',
			 targetElement.dataset.jsDefaultTheme);
		e.currentTarget.setAttribute('arial-expanded', true);
	} else {
		targetElement.setAttribute('data-color-theme',
			 e.currentTarget.dataset.theme);
		e.currentTarget.setAttribute('arial-expanded', false);
	}
}

function handleNavMenuItem(e) {
	const navbarNav = e.target.closest('.navbar__nav');
	const navbarNavCloseBtn = navbarNav.querySelector(
		'.navbar__nav-header [data-dismiss]');
	navbarNavCloseBtn.click();
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

function handleWordleSectionsClass(sections, observer) {
	sections.forEach(section => {
		if (section.type === 'attributes'
			&& section.attributeName === 'class'
			&& section.target.matches('.show, .active')
		) {
			visibleSectionElement = section.target;
		} else visibleSectionElement = wordleSectionElements[0];
	})
}

function handleSectionKeyNavigations(e) {
	// escape key
	if (e.keyCode === 27) {
		const sectionDismissToggle = visibleSectionElement.querySelector(`
		[data-dismiss][data-target=${visibleSectionElement.getAttribute('id')}`);
		sectionDismissToggle.click();
	}
}

const WORDLE_TILE_STATE = {
	reveal: 'revealWordState',
	guessing: 'guessing',
	guessingError: 'notifyGuessError',
	guessWordWon: 'notifyGuessWon'
}

function handleWordleGameKeyNavigation(e) {
	// backspace key
	if (e.keyCode === 8) handleBackspaceGuessing();
	// enter key
	if (e.keyCode === 13) handleRecentGuess();
	// a-z keys
	if (e.keyCode>64 && e.keyCode<91) {
		const alphabet = e.code.slice(3);
		handleBoardGuessInsertion(alphabet);
	}
}

function handleBoardGuessInsertion(value) {
	if (wordleGameLogic.hasGuessedWord 
		|| wordleGameLogic.remainingLives === 0) return;
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
	if (currentLetterIndex<1 || wordleGameLogic.hasGuessedWord) return
	currentLetterIndex--;
	let currentLetter = wordleBoard.children[wordleGameLogic.rowGuessingAt]
		.children[currentLetterIndex];
	currentLetter.innerText = '';
	currentLetter.removeAttribute('data-letter-state');
	currentLetter.classList.remove(WORDLE_TILE_STATE.guessing);
}

function handleWordleKeyboardInput(e) {
	const keyInput = e.target.dataset.keyboardKey;
	if (keyInput==='enter') handleRecentGuess();
	if (keyInput==='backspace') handleBackspaceGuessing();
	if (keyInput.match(/^[a-z]$/)) handleBoardGuessInsertion(keyInput);
}

function getCleanInterval(duration, dirtyIntrval) {
	return eval(`${duration}${dirtyIntrval[1]}${dirtyIntrval.slice(2, -2)}`);
}

function updateWordleBoard() {
	const flipDuration = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-fliping-duration-ms').slice(0, -2);
	let dirtyFlipInterval = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-fliping-interval-ms');
	const bubbleDuration = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-bubble-duration-ms').slice(0, -2);
	let dirtyBubbleInterval = getComputedStyle(wordleBoard)
		.getPropertyValue('--tile-bubble-interval-ms');

	wordleGameLogic.board.forEach((word, wordIndex) => {
		let wordleWordRow = Array.from(wordleBoard.children[wordIndex].children);

		word.forEach((letter, letterIndex) => {
			let wordleLetterCol = wordleWordRow[letterIndex];

			wordleLetterCol.innerText = letter.value || "";
			letter.state && wordleLetterCol.setAttribute('data-letter-state', letter.state);
			wordleLetterCol.style.setProperty('--flip-delay',
				`${getCleanInterval(flipDuration, dirtyFlipInterval) * letterIndex}ms`);
			wordleLetterCol.style.setProperty('--bubble-delay',
				`${getCleanInterval(bubbleDuration, dirtyBubbleInterval) * letterIndex}ms`);

			// flip tile after update
			if (wordleLetterCol.matches('[data-letter-state]')) {
				wordleLetterCol.style.animationDuration = 'var(--tile-fliping-duration-ms)';
				wordleLetterCol.classList.add(WORDLE_TILE_STATE.reveal);
			}
		})

		// show wining tiles
		const lastFlippedTIle = wordleWordRow[wordleWordRow.length - 1];
		lastFlippedTIle.addEventListener('animationend', (e) => {
			// after last tile flip
			if (wordleGameLogic.hasGuessedWord
				&& wordIndex === wordleGameLogic.hasGuessedWordRow) {
				wordleWordRow.forEach((letter, letterIndex) => {
					letter.style.animationDuration = 'var(--tile-bubble-duration-ms)';
					letter.classList.add(WORDLE_TILE_STATE.guessWordWon);
				})
			}
		}, {once: true})
	})
}

function updateKeyboardGuessedLetters() {
	wordleGameLogic.guessedLetters.forEach(letter => {
		wordleKeyboard.querySelector(`[data-keyboard-key="${letter.value}"]`)
			.setAttribute('data-letter-state', letter.state);
		wordleKeyboard.querySelector(`[data-keyboard-key="${letter.value}"]`)
	});
}

function shakeGuessWord(boardRow) {
	const guessLetters = Array.from(wordleBoard.children[boardRow].children);
	guessLetters.forEach(letter => {
		letter.style.animationDuration = 'var(--shaking-duration)';
		letter.classList.add(WORDLE_TILE_STATE.guessingError);
		// return to guess animation end state
		letter.addEventListener('animationend', () => {
			letter.style.animationDuration = '0ms';
			letter.classList.remove(WORDLE_TILE_STATE.guessingError);
		}, { once: true })
	})
}

function flashWordleMessage(message) {
	const displayTimeMs = 1000;
	let msgItem = document.querySelector("#wordle-game__flash-msgs-item-template")
		.content.cloneNode(true)
		.querySelector('.wordle-game__flash-msgs-item');
	msgItem.querySelector('.text').innerText = message;

	wordleFlashMsg.prepend(msgItem);
	setTimeout(() => {
		msgItem.classList.add('hide')
		msgItem.addEventListener('transitionend', () => {
			msgItem.remove();
		})
	}, displayTimeMs)
}

function handleRecentGuess() {
	let guess = '';
	// creat guess string
	let word = Array.from(wordleBoard.children[wordleGameLogic.rowGuessingAt].children)
	word.forEach(letter => guess += letter.innerText.toLowerCase());

	wordleGameLogic.validateGuess(guess, (response) => {
		if (response === 'valid') {
			wordleGameLogic.handleGuess(guess);
			handleWordleGameplay();
		} else if (response === 'short' 
				|| response === 'long') {
			shakeGuessWord(wordleGameLogic.rowGuessingAt)
		} else if (response === 'has guessed') {
			shakeGuessWord(wordleGameLogic.rowGuessingAt)
			flashWordleMessage('Has guessed word');
		} else if (response === 'invalid') {
			shakeGuessWord(wordleGameLogic.rowGuessingAt)
			flashWordleMessage('word not in list')
		}
	})
}

function displaySessionOutcome() {
	let lastFlippedRowIndex = wordleGameLogic.hasGuessedWordRow 
			|| wordleGameLogic.rowGuessingAt;
	let lastFlippedTile = wordleBoard.children[lastFlippedRowIndex].lastElementChild;

	const performTask = (msg) => {
		wordleOutcomeDisplay.innerText = msg;
		wordleOutcomeDisplay.classList.add('show');
		wordleOutcomeDisplay.addEventListener('transitionend', () => {
			const wordleStatsToggle = document.querySelector(
				`[data-target="wordle-game__stats"]`);

			setTimeout(() => {
				if (wordleStatsToggle.getAttribute('arial-expanded')==='false') {
					wordleStatsToggle.click()
				}
			}, 700);
		}, {once: true})
	}

	lastFlippedTile.addEventListener('animationend', e => {
		// didnt guess word
		if (wordleGameLogic.remainingLives === 0
			&& e.target.classList.contains(WORDLE_TILE_STATE.reveal))
			performTask(wordleGameLogic.wordToGuess.toUpperCase());

		// did guess word
		if (wordleGameLogic.hasGuessedWord
			&& e.target.classList.contains(WORDLE_TILE_STATE.guessWordWon))
			performTask('You win!');
	})
}

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

function handleSessionBtnUsability() {
	const btns = wordleSessionContent.querySelectorAll('.wordle-game__session-btn');

	const performTask = (e) => {
		e.preventDefault();
		const clickedOn = e.target.dataset.forSession;
		const closeSectionBtn = document.querySelector('.wordle-game__stats-close')
		if (clickedOn === 'play-again') {
			wordleGameLogic.newGame();
			clearPreviousGameplay()
			handleWordleGameplay();
			closeSectionBtn.click();
		}
	}

	if (wordleGameLogic.hasGuessedWord || wordleGameLogic.remainingLives === 0) {
		wordleSessionContent.classList.remove('display-none');
		btns.forEach(btn => btn.addEventListener('click', performTask));
	} else {
		wordleSessionContent.classList.add('display-none');
		btns.forEach(btn => btn.removeEventListener('click', performTask));
	}
}

function handleWordleGameplay() {
	currentLetterIndex = 0;
	updateWordleBoard();
	updateKeyboardGuessedLetters();
	displaySessionOutcome();
	handleSessionBtnUsability();
}

const wordleGameLogic = new Wordle();
const refreshWordleGame = setInterval(() => {
	let currentTime = new Date().toLocaleTimeString("en-US", { houe12: false });
	let currentHour = Number(currentTime.split(":")[0]);
	if (currentHour<1) wordleGameLogic.newGame();
}, 1000)


let currentLetterIndex = 0;
let visibleSectionElement = null;

let wordleSectionSelectors = ['wordle-game', 'wordle-game__stats', 'settings', 'how-to-play'];
const wordleSectionElements = wordleSectionSelectors.map(sl => document.getElementById(sl));

const observeClassOption = { attributes: true };
const wordleSectionsObserver = new IntersectionObserver(handleWordleSections, {});
const wordleSectionClassObserver = new MutationObserver(handleWordleSectionsClass);

visibleSectionElement = wordleSectionElements[0];
wordleSectionElements.forEach(section => 
	wordleSectionClassObserver.observe(section, observeClassOption));

const wordleBoard = document.querySelector('.wordle-game__board');
const wordleKeyboard = document.querySelector('.wordle-game__keyboard');
const wordleOutcomeDisplay = document.querySelector('.wordle-game__outcome');
const wordleSessionContent = document.querySelector('.wordle-game__session');

const wordleKeyboardKeys = document.querySelectorAll('.wordle-game__keyboard-key');
wordleKeyboardKeys.forEach(key => key.addEventListener('click', handleWordleKeyboardInput));

const wordleFlashMsg = document.querySelector('.wordle-game__flash-msgs');

const wordleGameSection = document.querySelector('#wordle-game');
wordleSectionsObserver.observe(wordleGameSection);

const triggerToggles = document.querySelectorAll('[data-toggle]');
triggerToggles.forEach(toggle => toggle.addEventListener('click', handleToggleTrigger));

const dismissToggles = document.querySelectorAll('[data-dismiss]');
dismissToggles.forEach(toggle => toggle.addEventListener('click', handleToggleDismiss));

const colorThemeToggles = document.querySelectorAll(`[data-toggle='color-theme']`)
colorThemeToggles.forEach(toggle => toggle.addEventListener('input', handleThemeToggle));

const navbarNav = document.querySelector('.navbar__nav')
wordleSectionClassObserver.observe(navbarNav, observeClassOption);

const navMenuItems = document.querySelectorAll('.navbar__menu-item')
navMenuItems.forEach(navItem => navItem.addEventListener('click', handleNavMenuItem));

document.addEventListener('keydown', e => {
	wordleSectionElements.forEach((element, index) => {
		if (visibleSectionElement !== element) return
		if (index === 0) handleWordleGameKeyNavigation(e);
		else if (index > 0) handleSectionKeyNavigations(e)
	})
})

document.addEventListener('DOMContentLoaded', () => {
	handleWordleGameplay();

	// swith on toggle for respective theme
	const currentTheme = document.querySelector('body')
		.getAttribute('data-color-theme');
	const currentThemeToggle = document.querySelector(
		`[data-toggle="color-theme"][data-theme="${currentTheme}"]`);
	currentThemeToggle && currentThemeToggle.click();
})