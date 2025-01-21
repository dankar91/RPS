
class HandGestureRecognizer:
    def __init__(self):
        self.last_gesture = None
        self.gesture_confidence = 0
        self.final_gesture = None
        
    def get_finger_states(self, landmarks):
        finger_states = []
        
        # Большой палец не учитываем в распознавании
        finger_states.append(False)
        
        # Остальные пальцы
        finger_tips = [8, 12, 16, 20]  # кончики пальцев
        finger_mcp = [5, 9, 13, 17]    # основания пальцев
        
        for i in range(4):
            # Палец считается выпрямленным, если его кончик находится 
            # значительно выше основания
            finger_height = landmarks[finger_mcp[i]]['y'] - landmarks[finger_tips[i]]['y']
            finger_is_extended = finger_height > 0.1  # Пороговое значение
            finger_states.append(finger_is_extended)
        
        return finger_states

    def detect_gesture(self, landmarks):
        finger_states = self.get_finger_states(landmarks)
        
        # Камень (кулак) - все пальцы согнуты (кроме большого)
        is_rock = all(not state for state in finger_states[1:])
        
        # Ножницы - указательный и средний выпрямлены, остальные согнуты
        is_scissors = (finger_states[1] and finger_states[2] and 
                      not finger_states[3] and not finger_states[4])
        
        # Бумага - все пальцы выпрямлены (кроме большого)
        is_paper = all(state for state in finger_states[1:])
        
        if is_rock:
            return 'rock'
        if is_scissors:
            return 'scissors'
        if is_paper:
            return 'paper'
        
        return None

    def translate_gesture(self, gesture):
        translations = {
            'rock': 'Камень ✊',
            'paper': 'Бумага ✋',
            'scissors': 'Ножницы ✌️'
        }
        return translations.get(gesture, gesture)
