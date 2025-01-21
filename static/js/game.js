class RockPaperScissorsGame {
    constructor() {
        this.aiScore = 0;
        this.playerScore = 0;
        this.socket = io();
        this.setupSocketListeners();
        this.setupGameElements();
    }

    setupGameElements() {
        // Get elements and handle potential null values
        this.aiScoreElement = document.getElementById('ai-score') || this.createScoreElement('ai-score');
        this.playerScoreElement = document.getElementById('player-score') || this.createScoreElement('player-score');
        this.aiChoiceElement = document.getElementById('ai-choice') || this.createChoiceElement();
        this.resultElement = document.getElementById('result-message') || this.createResultElement();
    }

    createScoreElement(id) {
        const element = document.createElement('span');
        element.id = id;
        element.textContent = '0';
        document.querySelector('.score-board').appendChild(element);
        return element;
    }

    createChoiceElement() {
        const element = document.createElement('div');
        element.id = 'ai-choice';
        element.innerHTML = '<h3>Ожидание хода...</h3>';
        document.querySelector('.ai-side .card-body').appendChild(element);
        return element;
    }

    createResultElement() {
        const element = document.createElement('div');
        element.id = 'result-message';
        document.body.appendChild(element);
        return element;
    }

    setupSocketListeners() {
        this.socket.on('game_result', (data) => {
            this.handleGameResult(data);
        });

        this.socket.on('game_reset', () => {
            this.resetGame();
        });
    }

    async handlePlayerMove(gesture) {
        if (this.gameInProgress) {
            return;
        }
        this.gameInProgress = true;
        
        // Show countdown animation
        await this.showCountdown();
        this.socket.emit('player_gesture', { gesture });
    }

    showCountdown() {
        return new Promise((resolve) => {
            const container = document.querySelector('.container');
            let count = 3;
            
            const showNumber = () => {
                if (document.querySelector('.countdown')) {
                    return; // Предотвращаем множественные анимации
                }
                
                const countElement = document.createElement('div');
                countElement.className = 'countdown';
                let text = '';
                switch(count) {
                    case 3:
                        text = '1';
                        break;
                    case 2:
                        text = '2';
                        break;
                    case 1:
                        text = '3';
                        break;
                    case 0:
                        text = 'ГО!';
                        break;
                }
                countElement.textContent = text;
                container.appendChild(countElement);
                
                // Воспроизводим звук через оба бэкенда
                fetch(`/play_sound/countdown/${count}`);
                if (window.gameAudio) {
                    window.gameAudio.playCountdown(count);
                }
                
                setTimeout(() => {
                    if (countElement.parentNode) {
                        container.removeChild(countElement);
                    }
                    count--;
                    
                    if (count >= 0) {
                        setTimeout(() => showNumber(), 200); // Небольшая пауза между числами
                    } else {
                        resolve();
                    }
                }, 800);
            };
            
            showNumber();
        });
    }

    handleGameResult(data) {
        const { player_gesture, ai_gesture, winner, scores, statistics } = data;
        
        // Add 3 second pause between rounds
        setTimeout(() => {
            this.gameInProgress = false;
        }, 3000);
        
        // Update previous round info
        const gestureEmoji = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        document.getElementById('prev-player-move').textContent = gestureEmoji[player_gesture] || '-';
        document.getElementById('prev-ai-move').textContent = gestureEmoji[ai_gesture] || '-';
        
        // Update scores
        this.aiScore = scores.ai;
        this.playerScore = scores.player;
        this.updateScoreDisplay();

        // Update statistics
        if (statistics) {
            document.getElementById('total-games').textContent = statistics.total_games;
            document.getElementById('win-rate').textContent = statistics.player_win_rate + '%';
            document.getElementById('tie-rate').textContent = statistics.tie_rate + '%';
        }

        // Show AI choice
        this.showAIChoice(ai_gesture);

        // Show result message
        this.showResult(winner);

        // Trigger animation
        this.playResultAnimation(winner);

        // Play sound through both backends
        if (winner === 'player') {
            fetch('/play_sound/win');
            if (window.gameAudio) window.gameAudio.playWin();
        } else if (winner === 'ai') {
            fetch('/play_sound/lose');
            if (window.gameAudio) window.gameAudio.playLose();
        } else {
            fetch('/play_sound/tie');
            if (window.gameAudio) window.gameAudio.playTie();
        }
    }

    updateScoreDisplay() {
        this.aiScoreElement.textContent = this.aiScore;
        this.playerScoreElement.textContent = this.playerScore;
    }

    showAIChoice(choice) {
        const iconMap = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        
        this.aiChoiceElement.innerHTML = `
            <h3>AI chose: ${iconMap[choice]}</h3>
        `;
    }

    showResult(winner) {
        const messages = {
            player: 'You win! 🎉',
            ai: 'AI wins! 🤖',
            tie: "It's a tie! 🤝"
        };

        this.resultElement.textContent = messages[winner];
        this.resultElement.classList.add('show');
        setTimeout(() => {
            this.resultElement.classList.remove('show');
        }, 2000);
    }

    playResultAnimation(winner) {
        const playerCard = document.querySelector('.col-md-6:first-child .card');
        const aiCard = document.querySelector('.col-md-6:last-child .card');
        const playerGestureDebug = document.getElementById('gesture-debug');
        const aiChoice = document.getElementById('ai-choice');

        // Remove any existing animation classes
        playerCard.classList.remove('player-win', 'player-lose');
        aiCard.classList.remove('ai-win', 'ai-lose');

        if (winner === 'player') {
            playerCard.classList.add('player-win');
            aiCard.classList.add('ai-lose');
            if (playerGestureDebug) playerGestureDebug.classList.add('win-text');
            if (aiChoice) aiChoice.classList.add('lose-text');
        } else if (winner === 'ai') {
            playerCard.classList.add('player-lose');
            aiCard.classList.add('ai-win');
            if (playerGestureDebug) playerGestureDebug.classList.add('lose-text');
            if (aiChoice) aiChoice.classList.add('win-text');
        }

        // Remove animation classes after animation completes
        setTimeout(() => {
            playerCard.classList.remove('player-win', 'player-lose');
            aiCard.classList.remove('ai-win', 'ai-lose');
            if (playerGestureDebug) playerGestureDebug.classList.remove('win-text', 'lose-text');
            if (aiChoice) aiChoice.classList.remove('win-text', 'lose-text');
        }, 800);
    }

    resetGame() {
        this.aiScore = 0;
        this.playerScore = 0;
        this.updateScoreDisplay();
        this.aiChoiceElement.innerHTML = '<h3>Waiting for your move...</h3>';
        this.resultElement.textContent = '';
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RockPaperScissorsGame();
});
