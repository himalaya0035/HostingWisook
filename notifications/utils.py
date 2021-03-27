from django.contrib.auth import get_user_model

from notifications.models import Notification

User = get_user_model()


def create_notification(obj_id: int, obj_type: str, image, owner: User):
    n = Notification(owner=owner, image=image, type=obj_type, obj_id=obj_id)
    n.save()
