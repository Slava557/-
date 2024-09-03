let score = 0;
let currentWords = [];
let currentIndex = 0;
let timer;
let timeRemaining = 60;

async function fetchWords(difficulty) {
    const url = `https://api.datamuse.com/words?ml=${difficulty === 'easy' ? 'cat' : 'philosophy'}&max=1000`;

    let response = await fetch(url);
    let data = await response.json();

    return data.map(item => item.word);
}

function updateTimer() {
    if (timeRemaining > 0) {
        timeRemaining -= 1;
        document.getElementById('timer').innerText = `Time: ${timeRemaining} sec`;
    } else {
        clearInterval(timer);
        alert('Time is up! The round is over.');
        document.getElementById('word-display').innerText = 'Game Over';
    }
}

async function startGame(difficulty) {
    score = 0;
    currentIndex = 0;
    timeRemaining = 60;

    currentWords = await fetchWords(difficulty);

    document.getElementById('score').innerText = score;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('timer').innerText = `Time: ${timeRemaining} sec`;

    timer = setInterval(updateTimer, 1000);

    nextWord();
}

function nextWord() {
    if (currentIndex < currentWords.length && timeRemaining > 0) {
        document.getElementById('word-display').innerText = currentWords[currentIndex];
        currentIndex++;
    } else if (timeRemaining <= 0) {
        document.getElementById('word-display').innerText = 'Game Over';
    } else {
        alert('No more words available!');
    }
}

function addPoint() {
    if (timeRemaining > 0) {
        score += 1;
        document.getElementById('score').innerText = score;
        nextWord();
    }
}

function restartGame() {
    clearInterval(timer);
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}
