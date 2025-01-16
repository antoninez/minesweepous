const grid = document.getElementById('grid');
const resetButton = document.getElementById('reset');
const gridSize = 10;
const mineCount = 10;
let cells = [];
let minePositions = [];
let flaggedCells = new Set();
let gameOver = false;
let isFirstClick = true;

function initializeGame() {
    grid.innerHTML = '';
    cells = [];
    minePositions = [];
    flaggedCells.clear();
    gameOver = false;
    isFirstClick = true;
    document.body.style.animation = 'psychedelicBackground 5s linear infinite';

    // Créer la grille
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleLeftClick);
        cell.addEventListener('contextmenu', handleRightClick);
        grid.appendChild(cell);
        cells.push(cell);
    }

    updateMineCount();
    ultraCrazyAnimation();
}

function handleLeftClick(event) {
    if (gameOver) return;
    const index = parseInt(event.target.dataset.index);
    if (flaggedCells.has(index)) return;
    
    if (isFirstClick) {
        placeMines(index);
        isFirstClick = false;
        removeAllFlags();
    }
    
    applyRandomAnimation(event.target);
    cellClickAnimation(event);
    revealCell(index);
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;
    const index = parseInt(event.target.dataset.index);
    toggleFlag(index);
}

function placeMines(firstClickIndex) {
    const totalCells = gridSize * gridSize;
    const safeCells = new Set([firstClickIndex, ...getAdjacentCells(firstClickIndex)]);
    
    minePositions = [];
    while (minePositions.length < mineCount) {
        const randomIndex = Math.floor(Math.random() * totalCells);
        if (!safeCells.has(randomIndex) && !minePositions.includes(randomIndex)) {
            minePositions.push(randomIndex);
        }
    }
}

function removeAllFlags() {
    flaggedCells.forEach(index => {
        cells[index].classList.remove('flag');
    });
    flaggedCells.clear();
    updateMineCount();
}

function toggleFlag(index) {
    if (isFirstClick) return;
    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;

    if (flaggedCells.has(index)) {
        flaggedCells.delete(index);
        cell.classList.remove('flag');
    } else {
        flaggedCells.add(index);
        cell.classList.remove('flag');
        void cell.offsetWidth; // Force le reflow
        cell.classList.add('flag');
    }

    applyRandomAnimation(cell);
    updateMineCount();
    animateMineCount();
}

function revealCell(index) {
    const cell = cells[index];
    if (cell.classList.contains('revealed')) return;

    setTimeout(() => {
        cell.classList.add('revealed');
        if (minePositions.includes(index)) {
            cell.classList.add('mine');
            endGame(false);
        } else {
            const mineCount = countAdjacentMines(index);
            if (mineCount > 0) {
                cell.textContent = mineCount;
            } else {
                revealAdjacentCells(index);
            }
        }

        checkWinCondition();
    }, 50 * Math.sqrt(index)); // Délai progressif pour un effet de cascade
}

function countAdjacentMines(index) {
    let count = 0;
    const adjacentCells = getAdjacentCells(index);
    for (let cellIndex of adjacentCells) {
        if (minePositions.includes(cellIndex)) {
            count++;
        }
    }
    return count;
}

function getAdjacentCells(index) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const adjacentCells = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                adjacentCells.push(newRow * gridSize + newCol);
            }
        }
    }

    return adjacentCells;
}

function revealAdjacentCells(index) {
    const adjacentCells = getAdjacentCells(index);
    for (let cellIndex of adjacentCells) {
        if (!cells[cellIndex].classList.contains('revealed')) {
            revealCell(cellIndex);
        }
    }
}

function endGame(isWin) {
    gameOver = true;
    revealAllMines();
    setTimeout(() => {
        const gameInfo = document.createElement('div');
        gameInfo.id = 'game-info';
        gameInfo.textContent = isWin ? 'Vous avez gagné !' : 'Vous avez perdu !';
        grid.after(gameInfo);

        if (isWin) {
            victoryAnimation();
        } else {
            defeatAnimation();
        }
    }, 1000);
}

function revealAllMines() {
    for (let index of minePositions) {
        cells[index].classList.add('mine');
    }
}

function checkWinCondition() {
    const revealedCount = cells.filter(cell => cell.classList.contains('revealed')).length;
    if (revealedCount === gridSize * gridSize - mineCount) {
        endGame(true);
    }
}

function updateMineCount() {
    const remainingMines = mineCount - flaggedCells.size;
    const mineCountElement = document.getElementById('mine-count') || createMineCountElement();
    mineCountElement.textContent = `Mines restantes : ${remainingMines}`;
}

function createMineCountElement() {
    const mineCountElement = document.createElement('div');
    mineCountElement.id = 'mine-count';
    grid.before(mineCountElement);
    return mineCountElement;
}

function animateMineCount() {
    const mineCountElement = document.getElementById('mine-count');
    mineCountElement.classList.remove('shake');
    void mineCountElement.offsetWidth; // Force le reflow
    mineCountElement.classList.add('shake');
}

function animateResetButton() {
    resetButton.style.animation = 'spin 0.5s linear, dimensionalShift 2s ease-in-out';
    setTimeout(() => {
        resetButton.style.animation = 'pulse 2s infinite';
    }, 500);
}

function applyRandomAnimation(element) {
    applyRandom3DAnimation(element);
}

function applyRandom3DAnimation(element) {
    const animations = ['bounce3D', 'spin3D', 'flip3D', 'crazyRotate', 'dimensionalShift'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    element.style.animation = `${randomAnimation} 0.5s ease-out`;
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function cellClickAnimation(event) {
    const cell = event.target;
    cell.style.animation = 'crazyRotate 0.5s linear, dimensionalShift 1s ease-in-out';
    setTimeout(() => {
        cell.style.animation = '';
    }, 1000);
}

function victoryAnimation() {
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.style.animation = 'crazyRotate 1s linear infinite, dimensionalShift 2s ease-in-out infinite';
            applyInsaneEffect(cell);
        }, index * 50);
    });
    document.body.style.animation = 'psychedelicBackground 2s linear infinite';
}

function defeatAnimation() {
    cells.forEach(cell => {
        cell.style.animation = 'shake 0.5s infinite, crazyRotate 1s linear infinite, dimensionalShift 3s ease-in-out infinite';
        applyInsaneEffect(cell);
    });
    document.body.style.animation = 'psychedelicBackground 0.5s linear infinite';
}

function ultraCrazyAnimation() {
    document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) blur(${Math.random() * 5}px)`;
    requestAnimationFrame(ultraCrazyAnimation);
}

function applyInsaneEffect(element) {
    element.style.transform = `scale(${1 + Math.random()}) rotate(${Math.random() * 360}deg)`;
    element.style.filter = `hue-rotate(${Math.random() * 360}deg) contrast(${150 + Math.random() * 100}%)`;
}

resetButton.addEventListener('click', () => {
    animateResetButton();
    initializeGame();
});

initializeGame();
