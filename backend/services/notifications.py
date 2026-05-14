from sqlalchemy.orm import Session

from models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
    n = Notification(user_id=user_id, title=title, message=message)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
