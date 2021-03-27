from django.urls import path, include

from . import views
from .oauth import urls as oauth_urls

api_urls = [
    path('register', views.Register.as_view()),
    path('login', views.LoginView.as_view()),
    path('profile', views.GetUserProfile.as_view()),
    path('profile/<int:pk>', views.ProfileView.as_view()),
    path('follow_unfollow_action', views.FollowUnFollowActionView.as_view()),
    path('profile/update', views.ProfileUpdateView.as_view()),
    path('top-users', views.TopUsersView.as_view()),
    path('user/<int:user_id>/<str:data_type>', views.GetFollowerOrFollowing),
    path('all-users', views.AllUsersView.as_view())
]

urlpatterns = [
    path('logout', views.LogoutView.as_view()),
    path('oauth/', include(oauth_urls)),

    path('api/', include(api_urls))

]
