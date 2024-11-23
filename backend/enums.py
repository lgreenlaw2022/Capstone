from enum import Enum


class MetricType(Enum):
    COMPLETE_MODULES = "complete_modules"
    EARN_GEMS = "earn_gems"
    EXTEND_STREAK = "streak_length"
    # Add more metrics as needed
    # consider: goals completed


class TimePeriodType(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class QuizType(Enum):
    PYTHON = "python"
    RECOGNITION = "recognition"
    CONCEPT = "concept"


class ModuleType(Enum):
    CONCEPT_GUIDE = "concept_guide"
    PYTHON_GUIDE = "python_guide"
    RECOGNITION_GUIDE = "recognition_guide"
    QUIZ = "quiz"
    CHALLENGE = "challenge"
    CHALLENGE_SOLUTION = "solution_guide"
    BONUS_CHALLENGE = "bonus_challenge"


class BadgeType(Enum):
    CONTENT = "content"
    AWARD = "award"


class EventType(Enum):
    COMPLETE_MODULE = "complete_module"
    UNIT_COMPLETION = "unit_completion"
    QUIZ_PERFECT_SCORE = "quiz_perfect_score"
    STREAK_ACHIEVEMENT = "streak_achievement"
    # goals completed
