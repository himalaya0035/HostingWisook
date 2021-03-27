from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.urls import path, include
from django.views.generic import TemplateView

from scraper.views import scrape
from django.views.static import serve
from django.conf.urls import url
User = get_user_model()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('hooks/api/', include('hook.urls')),
    path('temp', TemplateView.as_view(template_name='temp.html')),
    path('notifications/api', include('notifications.urls')),
    path('scrape', scrape),
    url(r'^media/(?P<path>.*)$', serve,{'document_root':       settings.MEDIA_ROOT}),
    url(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}),
]

urlpatterns += [
    path('accounts/reset_password/',
         (auth_views.PasswordResetView.as_view(template_name='passwordReset.html')),
         name="reset_password"),

    path('accounts/reset_password_sent',
         (auth_views.PasswordResetDoneView.as_view(template_name='passwordResetSent.html')),
         name="password_reset_done"),

    path('accounts/reset/<uidb64>/<token>',
         (auth_views.PasswordResetConfirmView.as_view(template_name='setNewPassword.html')),
         name="password_reset_confirm"),

    path('accounts/reset_password_complete',
         (auth_views.PasswordResetCompleteView.as_view(template_name='passwordResetComplete.html')),
         name="password_reset_complete"),
]

urlpatterns = urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns = urlpatterns + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# urlpatterns += staticfiles_urlpatterns()

urlpatterns += [
    path('', TemplateView.as_view(template_name='index.html'), name='homepage'),
    path('profile/<int>', TemplateView.as_view(template_name='profile.html')),
    path('hook/<int>', TemplateView.as_view(template_name='hook.html')),  # todo
    path('bookmarks', login_required(TemplateView.as_view(template_name='bookmark.html'))),
    path('interest/<str>/hooks', TemplateView.as_view(template_name='intrestHooks.html')),
    path('collections', login_required(TemplateView.as_view(template_name='collections.html'))),
    path('collection/<str>/hooks', TemplateView.as_view(template_name='collectionHooks.html')),
    path('notifications', login_required(TemplateView.as_view(template_name='notifications.html'))),
    path('interests', TemplateView.as_view(template_name='intrests.html'))
]
