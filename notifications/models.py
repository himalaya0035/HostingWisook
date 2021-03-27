from django.contrib.auth import get_user_model
# from django.contrib.contenttypes.models import ContentType
from django.db import models

User = get_user_model()


#
# class Notification(models.Model):
#     owner = models.ForeignKey(User, on_delete=models.CASCADE)
#     created_on = models.DateField(auto_now_add=True)
#
#     content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
#     object_id = models.PositiveIntegerField()
#     content_object = GenericForeignKey('content_type', 'object_id')
#


class Notification(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(null=True, max_length=100)
    image = models.URLField(null=True, blank=True)
    type = models.CharField(choices=[
        ('follower', 'follower'),
        ('comment', 'comment'),
        ('like', 'like')
    ], max_length=10)
    obj_id = models.PositiveIntegerField()
    created_on = models.DateTimeField(auto_now_add=True)
