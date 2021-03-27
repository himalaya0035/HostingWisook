import requests
from django.contrib.auth import get_user_model, login
from django.db.utils import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()


@api_view(['POST'])
@permission_classes([~IsAuthenticated])
def fb_authenticate(request):
    FBAccessToken = request.data.get('FBAccessToken')

    if FBAccessToken is None:
        return Response(data={
            'message': 'Missing access token'
        }, status=status.HTTP_400_BAD_REQUEST)

    data = requests.get(
        "https://graph.facebook.com/me?fields=id,name,email&access_token=" + FBAccessToken)
    if data.status_code == 200:
        data = data.json()

        try:
            user, created = User.objects.get_or_create(email=data['email'], full_name=data['name'], provider='Facebook')
        except IntegrityError as _:
            return Response(data={
                'message':
                    'User with this email already exists and isn\'t registered with facebook'
            }, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)

    return Response(status=status.HTTP_200_OK)
