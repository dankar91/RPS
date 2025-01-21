import random

class GameLogic:
    def __init__(self):
        """Инициализация игровой логики"""
        self.valid_gestures = ['rock', 'paper', 'scissors']
        self.winning_combinations = {
            'scissors': 'paper',    # ножницы режут бумагу
            'paper': 'rock',        # бумага накрывает камень
            'rock': 'scissors'      # камень ломает ножницы
        }
        self.scores = {'ai': 0, 'player': 0}
        self.game_history = []
        self.game_in_progress = False
        
    def validate_gesture(self, gesture):
        """Проверяет корректность жеста"""
        return gesture in self.valid_gestures
        
    def get_ai_choice(self):
        """Генерирует случайный выбор AI"""
        return random.choice(self.valid_gestures)
        
    def determine_winner(self, player_gesture, ai_gesture):
        """Определяет победителя раунда"""
        print(f"Determining winner: Player({player_gesture}) vs AI({ai_gesture})")
        
        if player_gesture is None or ai_gesture is None or not self.validate_gesture(player_gesture) or not self.validate_gesture(ai_gesture):
            print(f"Invalid or None gesture detected: player={player_gesture}, ai={ai_gesture}")
            return None
            
        if player_gesture == ai_gesture:
            winner = 'tie'
            print(f"It's a tie! Both chose {player_gesture}")
        elif self.winning_combinations[player_gesture] == ai_gesture:
            winner = 'player'
            print(f"Player wins! {player_gesture} beats {ai_gesture}")
        else:
            winner = 'ai'
            print(f"AI wins! {ai_gesture} beats {player_gesture}")
        
        # Добавляем результат в историю
        self.game_history.append(winner)
        print(f"Updated game history: {self.game_history}")
        return winner
            
    def update_score(self, winner):
        """Обновляет счет игры"""
        if winner in ['player', 'ai']:
            self.scores[winner] += 1
            
    def get_scores(self):
        """Возвращает текущий счет"""
        return self.scores
        
    def get_statistics(self):
        """Возвращает статистику игры"""
        total_games = len(self.game_history)
        if total_games == 0:
            return {
                'total_games': 0,
                'player_win_rate': 0,
                'ai_win_rate': 0,
                'tie_rate': 0
            }
            
        player_wins = sum(1 for result in self.game_history if result == 'player')
        ai_wins = sum(1 for result in self.game_history if result == 'ai')
        ties = sum(1 for result in self.game_history if result == 'tie')
        
        return {
            'total_games': total_games,
            'player_win_rate': f"{player_wins / total_games * 100:.1f}".replace(".", ","),
            'ai_win_rate': f"{ai_wins / total_games * 100:.1f}".replace(".", ","),
            'tie_rate': f"{ties / total_games * 100:.1f}".replace(".", ",")
        }
