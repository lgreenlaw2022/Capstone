from datetime import datetime, timedelta, timezone

def get_most_recent_monday():
    today = datetime.now(timezone.utc).date()
    most_recent_monday = today - timedelta(days=today.weekday())
    return most_recent_monday