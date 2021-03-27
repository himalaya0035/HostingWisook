from django.contrib import auth
from django.core.cache import cache
from django.core.handlers.wsgi import WSGIRequest
from django.db import models
from django.shortcuts import redirect, get_object_or_404
from django.views import View
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from . import models as app_models
from . import serializers
from .utils import get_qs_in_order

User = auth.get_user_model()


class Register(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


class GetUserProfile(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.UserProfileSerializer

    def get_object(self):
        return self.request.user


class FollowUnFollowActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        pk = request.data.get('user_id')
        if pk is None or pk == '' or action is None or action == '':
            return Response(
                data={
                    'message': 'Missing user_id or action attribute in request body'
                }
            )
        pk = int(pk)
        curr_user = request.user

        if curr_user.id == pk:
            return Response({'message': 'you cant follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        p = generics.get_object_or_404(app_models.Profile, user_id=pk)

        if action == 'follow':
            if p.follower.filter(id=curr_user.id).exists():
                return Response({'message': 'you are already following'})
            p.follower.add(curr_user)

            notif_qs = Notification.objects.filter(obj_id=curr_user.id)

            if not notif_qs.exists():
                Notification(owner_id=pk, type='follower', obj_id=curr_user.id, image=curr_user.prof_img,
                             name=curr_user.full_name).save()

            return Response({'message': 'you are now a follower'}, status=200)
        if action == 'unfollow':
            if p.follower.filter(id=curr_user.id).exists():
                p.follower.remove(curr_user)
                return Response({'message': 'you are no longer a follower'}, status=200)
            return Response({'message': 'you are not following'})


class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer(self, *args, **kwargs):
        return serializers.UserProfileSerializer(*args, **kwargs, remove_fields=[
            'profile',
            'email',
            'is_following',
            'interests'
        ], context=self.get_serializer_context())

    def get_object(self):
        return self.request.user


"""

num of posts
likes/post
num of jitne usko follow kr rhe

"""


class TopUsersView(generics.ListAPIView):
    serializer_class = serializers.UserListSerializer

    def get_queryset(self):
        top_users_qs = cache.get('top_users')

        # top_users_qs = None

        if top_users_qs is None:
            qs = app_models.HookUser.objects.all().annotate(
                num_of_posts=models.Count('hook'),
            ).order_by(
                -models.F('num_of_posts')
            ).values_list('id', flat=True)[:20]

            qs2 = get_qs_in_order(app_models.HookUser, qs).annotate(
                total_Num_of_likes=models.Sum('hook__likes'),
                num_of_posts=models.Count('hook'),
                post_likes_ratio=models.F('total_Num_of_likes') / models.F('num_of_posts')
            ).order_by(
                -models.F('post_likes_ratio')
            ).values_list('id', flat=True)[:12]

            top_users_qs = get_qs_in_order(app_models.HookUser, qs2).annotate(
                models.Count('following')
            ).order_by(
                -models.F('following__count')
            )[:6]

            cache.set('top_users', top_users_qs, 10800)

        return top_users_qs


class LogoutView(View):

    def get(self, request: WSGIRequest):
        user = request.user

        auth.logout(request)
        # homepage_url = request.build_absolute_uri(reverse("homepage"))
        #
        # if user.provider == 'Google':
        #     return HttpResponseRedirect(
        #         f'https: // www.google.com / accounts / Logout?continue=https: // appengine.google.com / _ah / logout?continue={homepage_url}')
        #
        return redirect('/')


class LoginView(APIView):
    permission_classes = [~permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serialized_data = serializers.UserLoginSerializer(data=request.data)
        if serialized_data.is_valid(raise_exception=True):

            user = auth.authenticate(request, **serialized_data.data)

            if user is not None:
                auth.login(request, user)
                # user_serialized = UserSerializer(user)

                # return Response(data=user_serialized.data, status=status.HTTP_200_OK)
                return Response(status=status.HTTP_200_OK)
            return Response(data={
                'message': 'invalid credentials'
            }, status=status.HTTP_404_NOT_FOUND)


class ProfileView(generics.RetrieveAPIView):
    def get_serializer(self, *args, **kwargs):
        context = self.get_serializer_context()

        return serializers.UserProfileSerializer(*args, **kwargs, context=context, remove_fields=['interests'])

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return User.objects.all()

        return User.objects.all()


@api_view(['GET'])
def GetFollowerOrFollowing(request, user_id, data_type):
    context = {
        'request': request
    }
    user_obj = get_object_or_404(User, pk=user_id)
    if data_type == 'following':
        qs = user_obj.following.all().values_list('user_id', flat=True)
        qs = User.objects.filter(pk__in=qs)
        serializer_instance = serializers.FollowerOrFollowingSerializer(qs, many=True, context=context,
                                                                        remove_fields=['is_following'])
        return Response(serializer_instance.data)
    elif data_type == 'followers':
        qs = user_obj.profile.follower.all()
        serializer_instance = serializers.FollowerOrFollowingSerializer(qs, many=True, context=context)

        return Response(serializer_instance.data)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)


from rest_framework.filters import SearchFilter


class AllUsersView(generics.ListAPIView):
    serializer_class = serializers.UserSearchSerializer
    queryset = User.objects.all()
    filter_backends = [SearchFilter]
    search_fields = ['^full_name']
