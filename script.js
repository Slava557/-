const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
let board = [];
let selectedPiece = null;
let isAITurn = false;

// Начальное состояние доски
const initialBoard = [
    [1, 1, 1, null, null, null, 2, 2],
    [1, 1, 1, null, null, null, 2, 2],
    [1, 1, 1, null, null, null, 2, 2],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [2, 2, 2, null, null, null, 1, 1],
    [2, 2, 2, null, null, null, 1, 1],
    [2, 2, 2, null, null, null, 1, 1]
];

// Объект с состоянием игры
class GameState {
    constructor(board, isAITurn) {
        this.board = board;
        this.isAITurn = isAITurn;
    }

    getAllPossibleMoves() {
        let moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((this.isAITurn && this.board[row][col] === 2) || (!this.isAITurn && this.board[row][col] === 1)) {
                    moves = moves.concat(this.getMovesForPiece(row, col));
                }
            }
        }
        return moves;
    }

    getMovesForPiece(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        let moves = [];
        for (let [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            if (this.isValidMove(row, col, newRow, newCol)) {
                moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
            }
        }
        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
        if (this.board[toRow][toCol] !== null) return false;
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff <= 1 && colDiff <= 1;
    }

    applyMove(move) {
        let newBoard = JSON.parse(JSON.stringify(this.board));
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
        newBoard[move.from.row][move.from.col] = null;
        return new GameState(newBoard, !this.isAITurn);
    }

    isGameOver() {
        const player1Goal = [
            [7, 7], [7, 6], [7, 5],
            [6, 7], [6, 6], [6, 5],
            [5, 7], [5, 6], [5, 5]
        ];
        const player2Goal = [
            [0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1], [1, 2],
            [2, 0], [2, 1], [2, 2]
        ];

        let player1Win = player1Goal.every(([r, c]) => this.board[r][c] === 1);
        let player2Win = player2Goal.every(([r, c]) => this.board[r][c] === 2);

        return player1Win || player2Win;
    }
}

// Функция оценки состояния доски
function evaluateBoard(gameState) {
    let score = 0;
    const player1Goal = [7, 7];
    const player2Goal = [0, 0];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (gameState.board[row][col] === 1) {
                score -= Math.abs(player1Goal[0] - row) + Math.abs(player1Goal[1] - col);
            } else if (gameState.board[row][col] === 2) {
                score += Math.abs(player2Goal[0] - row) + Math.abs(player2Goal[1] - col);
            }
        }
    }
    return score;
}

// Алгоритм Минимакс с альфа-бета отсечением
function minimax(gameState, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || gameState.isGameOver()) {
        return evaluateBoard(gameState);
    }

    const moves = gameState.getAllPossibleMoves();

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of moves) {
            const newGameState = gameState.applyMove(move);
            const eval = minimax(newGameState, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) {
                break; // Beta отсечение
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of moves) {
            const newGameState = gameState.applyMove(move);
            const eval = minimax(newGameState, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) {
                break; // Alpha отсечение
            }
        }
        return minEval;
    }
}

// Поиск лучшего хода для ИИ
function findBestMove(gameState, depth) {
    let bestMove = null;
    let bestValue = -Infinity;
    const moves = gameState.getAllPossibleMoves();

    for (let move of moves) {
        const newGameState = gameState.applyMove(move);
        const moveValue = minimax(newGameState, depth - 1, -Infinity, Infinity, false);
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
    }

    return bestMove;
}

// Инициализация доски
function initBoard() {
    board = initialBoard.map(row => row.slice());
    renderBoard();
    statusElement.textContent = "Ваш ход!";
}

// Отображение доски
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (board[row][col] === 1) {
                const piece = document.createElement("div");
                piece.className = "piece";
                cell.appendChild(piece);
            } else if (board[row][col] === 2) {
                const piece = document.createElement("div");
                piece.className
