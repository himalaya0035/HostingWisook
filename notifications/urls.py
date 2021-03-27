from django.urls import path

from .views import get_unread_notifs

urlpatterns = [
    path('', get_unread_notifs)
]
