from django.urls import path

from . import views

urlpatterns = [
    path('weekly-picks', views.WeeklyHitsView.as_view()),
    path('latest-hooks', views.LatestHooksView.as_view()),
    path('feed', views.UserFeedView.as_view()),
    path('hook/<int:pk>', views.HookView.as_view()),
    path('<int:hook_id>/comments', views.HookCommentsView.as_view()),
    path('create', views.HookCreateView.as_view()),
    path('comments/create/', views.HookCommentsCreateView.as_view()),
    path('collections/<int:pk>', views.CollectionActionView.as_view()),
    path('collections/<int:pk>/hooks', views.CollectionHooksView.as_view()),
    path('collections/', views.CollectionView.as_view()),
    path('user/<int:pk>/collections', views.UserCollectionsView.as_view()),

    path('user-interests-and-is-authenticated', views.IsAuthenticatedView.as_view()),

    # like unlike action
    path('<int:hook_id>/heart-action', views.HookActionView.as_view()),
    # bookmark action
    path('<int:hook_id>/bookmark-action', views.BookMarkActionView.as_view()),

    path('bookmarks', views.GetBookmarks.as_view()),

    path('user/<int:user_id>', views.UsersHookView.as_view()),
    path('top-interests', views.TopInterestsView.as_view()),

    path('add-to-my-hooks/<int:hook_id>', views.add_to_my_hooks),
    path('interest/<str:interest_name>', views.GetHooksByInterest.as_view()),

    path('all-hooks', views.HookSearchView.as_view()),
    path('all-interests', views.InterestSearchView.as_view()),
    path('user-all-interests', views.InterestSearchView2.as_view()),

    path('toggle-interest', views.ToggleInterest.as_view()),
    path('change-hook-collection/<int:hook_id>', views.ChangeHookCollection.as_view())
]
