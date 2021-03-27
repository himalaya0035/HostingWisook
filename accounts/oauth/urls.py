from django.urls import path

from . import facebook_views
from . import google_views
from .decorators import AnonymousRequired

urlpatterns = [
    path('google', AnonymousRequired(google_views.user_redirect), name='googleOauth'),
    path('google/oauth2callback', AnonymousRequired(google_views.callback), name='oauth2callback'),

    path('facebook', facebook_views.fb_authenticate)
]
