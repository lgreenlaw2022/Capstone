from enum import Enum

class MetricType(Enum):
    COMPLETE_MODULES = "complete_modules"
    EARN_GEMS = "earn_gems"
    EXTEND_STREAK = "streak_length"
    # Add more metrics as needed
    # consider: goals completed

class TimePeriodType(Enum):
    DAILY = "daily"
    MONTHLY = "monthly"

class QuizType(Enum):
    PYTHON = "python"
    RECOGNITION = "recognition"
    CONCEPT = "concept"

class ModuleType(Enum):
    CONCEPT_GUIDE = "study_guide"
    PYTHON_GUIDE = "python_guide"
    RECOGNITION_GUIDE = "recognition_guide"
    QUIZ = "quiz"
    CHALLENGE = "challenge"
    CHALLENGE_SOLUTION = "solution_guide"