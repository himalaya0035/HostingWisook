import google_auth_oauthlib.flow
from django.contrib.auth import get_user_model, login
from django.db import IntegrityError
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse

from google.auth.transport import requests
from google.oauth2 import id_token as id_token_verify

SCOPES = 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
CLIENT_SECRETS_FILE = "credentials.json"

User = get_user_model()


def user_redirect(request):
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    print(request.build_absolute_uri(reverse('oauth2callback')))
    flow.redirect_uri = request.build_absolute_uri(reverse('oauth2callback'))
    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type='offline',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')
    request.session['state'] = state
    return HttpResponseRedirect(authorization_url)


def callback(request):
    state = request.session['state']
    auth_response_url = request.build_absolute_uri()
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'credentials.json',
        scopes=SCOPES,
        state=state
    )

    flow.redirect_uri = request.build_absolute_uri(reverse('oauth2callback'))

    creds = flow.fetch_token(authorization_response=auth_response_url)

    id_token = creds['id_token']
    idinfo = id_token_verify.verify_oauth2_token(id_token, requests.Request())
    try:
        idinfo['sub']
    except ValueError:
        return HttpResponse('Invalid google Account')

    if idinfo['iss'] != 'https://accounts.google.com':
        return HttpResponse('Invalid Issuer')

    user_data = {
        'email': idinfo['email'],
        'full_name': idinfo['name'],
        'prof_img': idinfo['picture'],
    }
    try:
        obj, created = User.objects.get_or_create(email=user_data['email'], full_name=user_data['full_name'],
                                                  provider='Google')
    except IntegrityError as _:
        return JsonResponse({
            'message':
                'User with this email already exists and isn\'t registered with google'
        })

    if not created:
        obj.prof_img = user_data['prof_img']
    login(request, obj)
    return HttpResponseRedirect('/')
    # return HttpResponseRedirect(reverse('googleOauth'))
