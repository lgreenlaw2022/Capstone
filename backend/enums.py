from enum import Enum


class MetricType(Enum):
    COMPLETE_MODULES = "complete_modules"
    EARN_GEMS = "earn_gems"
    EXTEND_STREAK = "extend_streak"
    # Add more metrics as needed
    # consider: goals completed, unit completed


class TimePeriodType(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class QuizType(Enum):
    PYTHON = "python"
    RECOGNITION = "recognition"
    CONCEPT = "concept"


class ModuleType(Enum):
    CONCEPT_GUIDE = "CONCEPT_GUIDE"
    PYTHON_GUIDE = "PYTHON_GUIDE"
    RECOGNITION_GUIDE = "RECOGNITION_GUIDE"
    QUIZ = "QUIZ"
    CHALLENGE = "CHALLENGE"
    CHALLENGE_SOLUTION = "CHALLENGE_SOLUTION"
    BONUS_CHALLENGE = "BONUS_CHALLENGE"
    BONUS_SOLUTION = "BONUS_SOLUTION"


class BadgeType(Enum):
    CONTENT = "content"
    AWARD = "award"


class EventType(Enum):
    COMPLETE_MODULE = "complete_module"
    UNIT_COMPLETION = "unit_completion"
    QUIZ_PERFECT_SCORE = "quiz_perfect_score"
    STREAK_ACHIEVEMENT = "streak_achievement"
    # goals completed


class RuntimeValues(Enum):
    O_1 = "O(1)"
    O_LOG_N = "O(log n)"
    O_N = "O(n)"
    O_N_LOG_N = "O(n log n)"
    O_N_SQUARED = "O(n^2)"
    O_N_CUBED = "O(n^3)"
    O_2_N = "O(2^n)"
    O_N_FACTORIAL = "O(n!)"
