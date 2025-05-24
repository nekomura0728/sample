class NumberPuzzle {
    constructor() {
        this.size = 3;
        this.board = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.gameCompleted = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.newGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.messageDisplay = document.getElementById('message');
        this.newGameBtn = document.getElementById('newGame');
        this.restartBtn = document.getElementById('restart');
        this.difficultySelect = document.getElementById('difficulty');
        this.winModal = document.getElementById('winModal');
        this.finalMovesDisplay = document.getElementById('finalMoves');
        this.finalTimeDisplay = document.getElementById('finalTime');
        this.playAgainBtn = document.getElementById('playAgain');
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.difficultySelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.newGame();
        });
        this.playAgainBtn.addEventListener('click', () => {
            this.hideWinModal();
            this.newGame();
        });
        this.winModal.addEventListener('click', (e) => {
            if (e.target === this.winModal) {
                this.hideWinModal();
            }
        });
    }

    newGame() {
        this.stopTimer();
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        
        this.updateDisplay();
        this.generateSolvableBoard();
        this.renderBoard();
        this.showMessage('数字をクリックして移動させましょう！');
    }

    restartGame() {
        if (!this.gameStarted) return;
        
        this.stopTimer();
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        
        this.updateDisplay();
        this.renderBoard();
        this.showMessage('ゲームをリスタートしました');
    }

    generateSolvableBoard() {
        // 完成状態から始める
        this.board = [];
        for (let i = 0; i < this.size * this.size; i++) {
            this.board.push(i === this.size * this.size - 1 ? 0 : i + 1);
        }

        // ランダムに有効な移動を繰り返して混ぜる
        const shuffleMoves = this.size * this.size * 100;
        for (let i = 0; i < shuffleMoves; i++) {
            const emptyIndex = this.board.indexOf(0);
            const moveablePositions = this.getMoveablePositions(emptyIndex);
            if (moveablePositions.length > 0) {
                const randomPos = moveablePositions[Math.floor(Math.random() * moveablePositions.length)];
                this.swapTiles(emptyIndex, randomPos);
            }
        }
    }

    getMoveablePositions(emptyIndex) {
        const positions = [];
        const row = Math.floor(emptyIndex / this.size);
        const col = emptyIndex % this.size;

        // 上
        if (row > 0) positions.push((row - 1) * this.size + col);
        // 下
        if (row < this.size - 1) positions.push((row + 1) * this.size + col);
        // 左
        if (col > 0) positions.push(row * this.size + (col - 1));
        // 右
        if (col < this.size - 1) positions.push(row * this.size + (col + 1));

        return positions;
    }

    swapTiles(index1, index2) {
        [this.board[index1], this.board[index2]] = [this.board[index2], this.board[index1]];
    }

    renderBoard() {
        this.gameBoard.className = `game-board size-${this.size}`;
        this.gameBoard.innerHTML = '';

        const emptyIndex = this.board.indexOf(0);
        const moveablePositions = this.getMoveablePositions(emptyIndex);

        this.board.forEach((value, index) => {
            const tile = document.createElement('div');
            
            if (value === 0) {
                tile.className = 'tile empty';
            } else {
                tile.className = 'tile';
                tile.textContent = value;
                
                if (moveablePositions.includes(index)) {
                    tile.classList.add('moveable');
                    tile.addEventListener('click', () => this.moveTile(index));
                }
            }
            
            this.gameBoard.appendChild(tile);
        });
    }

    moveTile(tileIndex) {
        if (this.gameCompleted) return;

        const emptyIndex = this.board.indexOf(0);
        const moveablePositions = this.getMoveablePositions(emptyIndex);

        if (moveablePositions.includes(tileIndex)) {
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
            }

            this.swapTiles(emptyIndex, tileIndex);
            this.moves++;
            this.updateDisplay();
            this.renderBoard();

            // アニメーション効果
            setTimeout(() => {
                const tiles = this.gameBoard.querySelectorAll('.tile');
                tiles[emptyIndex].classList.add('moving');
                setTimeout(() => {
                    tiles[emptyIndex].classList.remove('moving');
                }, 200);
            }, 10);

            if (this.checkWin()) {
                this.gameWon();
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.board.length - 1; i++) {
            if (this.board[i] !== i + 1) {
                return false;
            }
        }
        return this.board[this.board.length - 1] === 0;
    }

    gameWon() {
        this.gameCompleted = true;
        this.stopTimer();
        this.showMessage('🎉 パズル完成！おめでとうございます！');
        
        setTimeout(() => {
            this.showWinModal();
        }, 1000);
    }

    showWinModal() {
        this.finalMovesDisplay.textContent = this.moves;
        this.finalTimeDisplay.textContent = this.formatTime(this.timer);
        this.winModal.classList.remove('hidden');
    }

    hideWinModal() {
        this.winModal.classList.add('hidden');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.movesDisplay.textContent = this.moves;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showMessage(text) {
        this.messageDisplay.textContent = text;
        setTimeout(() => {
            if (this.messageDisplay.textContent === text) {
                this.messageDisplay.textContent = '';
            }
        }, 3000);
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new NumberPuzzle();
});