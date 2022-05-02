import { getRandomWord, isWordInDictionary } from './WordServices.js';


const SESSION_DATA_KEY = 'oghenetefa-wordle-clone-data';
const LETTER_STATE = {
  NONE: null,
  CORRECT: 'success',
  PRESENT: 'warning',
  WRONG: 'secondary'
}

export default function Wordle() {
  const totalLives = 6;
  let board;
  let wordToGuess;
  let recentGuess;
  let guessedLetters;
  let guessedWords;
  let hasGuessedWord;
  let hasGuessedWordRow;
  let remainingLives;
  let currentRowAt;

  Object.defineProperties(this, {
    board: { get: () => [...board] },
    rowGuessingAt: { get: () => currentRowAt },
    wordToGuess: { get: () => [...wordToGuess].join("") },
    totalLives: { get: () => totalLives },
    remainingLives: { get: () => remainingLives },
    hasGuessedWord: { get: () => hasGuessedWord },
    hasGuessedWordRow: { get: () => hasGuessedWordRow },
    guessedLetters: { get: () => [...guessedLetters] }
  })

  this.viewGameplay = () => {
    console.log(`
			\t-- GAME-BOARD --
			+ + + + + + + + + + + + +
			${board.map(word => `+\t${word.map(letterObj =>
      letterObj.value).join("\t").toUpperCase()} \t+`
    ).join('\n\t\t\t')}
			+ + + + + + + + + + + + +

			--CURRENT ROW = ${currentRowAt + 1}
			--RECENT GUESS = ${recentGuess.join("").toUpperCase()}
			--HAS SUCCESSFULLY GUESSED = ${hasGuessedWord}
			--SUCCESSFULLY GUESSED ROW = ${hasGuessedWordRow && hasGuessedWordRow + 1}
			--GUESSED WORDS = ${guessedWords.join(" - ")}
			--GUESSED LETTERS = ${guessedLetters.map(letter =>
      letter.value.toUpperCase()
    ).join(" ")} 
		`);
  }

  this.newGame = () => {
    setWordToGuess();
    setBoard();
    recentGuess = [];
    guessedLetters = [];
    guessedWords = [];
    hasGuessedWord = false;
    hasGuessedWordRow = null;
    remainingLives = totalLives;
    currentRowAt = 0;
    syncSessionData();
  }

  this.validateGuess = (word, callBack) => {
    if (hasGuessedWord || remainingLives === 0) return;
    else if (word.length < wordToGuess.length) callBack('short');
    else if (word.length > wordToGuess.length) callBack('long');
    else if (guessedWords.includes(word)) callBack('has guessed');
    else if (!isWordInDictionary(word)) callBack('invalid');
    else callBack('valid');

    //else if (!wordleDictionary.includes(word)) callBack('invalid');
    /*
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
      data?.title && callBack('invalid');
      data[0]?.word && callBack('valid');
    }).catch(err => callBack(err));
    */
  }

  this.handleGuess = (word) => {
    if (hasGuessedWord || remainingLives === 0) return;

    recentGuess = word.split("");
    guessedWords.push(word);

    wordToGuess.forEach((letter, letterIndex) => {
      // update the board with recent guess letters
      board[currentRowAt][letterIndex].value = recentGuess[letterIndex];

      // update the board recent guess letters state
      if (letter === recentGuess[letterIndex])
        board[currentRowAt][letterIndex].state = LETTER_STATE.CORRECT;
      else if (wordToGuess.includes(recentGuess[letterIndex]))
        board[currentRowAt][letterIndex].state = LETTER_STATE.PRESENT;
      else board[currentRowAt][letterIndex].state = LETTER_STATE.WRONG;
    })

    // set unique guessed letters using wordle board and prev guessed letters
    let uniqueLetters = [...new Map(
      [...guessedLetters, ...board[currentRowAt]].map(letter => [letter.value, letter])
    ).values()]

    guessedLetters = uniqueLetters;
    hasGuessedWord = board[currentRowAt].every(letter => letter.state === LETTER_STATE.CORRECT);
    hasGuessedWordRow = hasGuessedWord ? currentRowAt : null;
    remainingLives--;
    currentRowAt = remainingLives === 0 ? totalLives - 1 : totalLives - remainingLives;
    syncSessionData();
  }

  const setWordToGuess = () => wordToGuess = getRandomWord().split("");

  const setBoard = () => {
    board = new Array(totalLives).fill('').map(row =>
      new Array(wordToGuess.length).fill('').map(letter => {
        return { value: null, state: LETTER_STATE.NONE }
      })
    );
  }

  this.clearStoredData = () => {
    localStorage.removeItem(SESSION_DATA_KEY)
  }

  const syncSessionData = () => {
    let sessionData = {
      board,
      wordToGuess,
      recentGuess,
      guessedLetters,
      guessedWords,
      hasGuessedWord,
      hasGuessedWordRow,
      remainingLives,
      currentRowAt
    }
    localStorage.setItem(SESSION_DATA_KEY,
      JSON.stringify(sessionData));
  }

  const loadSessionData = (user) => {
    board = [...user.board];
    wordToGuess = [...user.wordToGuess];
    recentGuess = [...user.recentGuess];
    guessedLetters = [...user.guessedLetters];
    guessedWords = [...user.guessedWords];
    hasGuessedWord = user.hasGuessedWord;
    hasGuessedWordRow = user.hasGuessedWordRow;
    remainingLives = user.remainingLives;
    currentRowAt = user.currentRowAt;
    syncSessionData();
  }

  let user = JSON.parse(localStorage.getItem(SESSION_DATA_KEY));
  if (user) loadSessionData(user)
  else this.newGame()
}
