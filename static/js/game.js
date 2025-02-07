class RockPaperScissorsGame {
    constructor() {
        this.aiScore = 0;
        this.playerScore = 0;
        this.socket = io();
        this.setupSocketListeners();
        this.setupGameElements();
    }

    setupGameElements() {
        // Получаем элементы и обрабатываем потенциальные нулевые значения
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
        
        // Показываем анимацию обратного отсчета
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
        
        // Добавим 3 секунды между раундами
        setTimeout(() => {
            this.gameInProgress = false;
        }, 3000);
        
        // Обновим информацию о предыдущем раунде
        const gestureEmoji = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        document.getElementById('prev-player-move').textContent = gestureEmoji[player_gesture] || '-';
        document.getElementById('prev-ai-move').textContent = gestureEmoji[ai_gesture] || '-';
        
        // Обновим очки
        this.aiScore = scores.ai;
        this.playerScore = scores.player;
        this.updateScoreDisplay();

        // Обновим статистику
        if (statistics) {
            document.getElementById('total-games').textContent = statistics.total_games;
            document.getElementById('win-rate').textContent = statistics.player_win_rate + '%';
            document.getElementById('tie-rate').textContent = statistics.tie_rate + '%';
        }

        // Показываем выбор AI
        this.showAIChoice(ai_gesture);

        // Показываем результат
        this.showResult(winner);

        // Анимация
        this.playResultAnimation(winner);

       

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


document.addEventListener('DOMContentLoaded', () => {
    window.game = new RockPaperScissorsGame();
});
