from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework import permissions
from rest_framework.decorators import permission_classes, api_view
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from . import models as app_models
from . import serializers
from .pagination import StandardResultsSetPagination
from .permissions import IsOwnerOrReadOnly
from .utils import add_to_users_pin

User = get_user_model()


class WeeklyHitsView(generics.ListAPIView):
    serializer_class = serializers.HookListSerializer
    queryset = app_models.Hook.objects.get_weekly_picks(12)


class LatestHooksView(generics.ListAPIView):
    serializer_class = serializers.HookListSerializer
    pagination_class = StandardResultsSetPagination
    queryset = app_models.Hook.objects.order_by('-pk')


class UserFeedView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.HookListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        followers = user.following.values_list('user_id')
        users_related_interests = user.interests.all().values_list('pk')
        related_interests_feed = app_models.Hook.objects.exclude(owner=user). \
            filter(
            models.Q(related_interest_id__in=users_related_interests) | models.Q(owner_id__in=followers)
        ). \
            distinct().order_by('-created_on')

        # print(app_models.Hook.objects.filter(
        #     models.Q(related_interest_id__in=users_related_interests) |
        #     models.Q(owner_id__in=followers)).distinct()
        # )
        return related_interests_feed


class HookView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = serializers.HookSerializer
    queryset = app_models.Hook

    def get_object(self):
        obj: app_models.Hook = super(HookView, self).get_object()
        obj.number_of_views += 1
        obj.save()
        return obj


class HookCreateView(generics.CreateAPIView):
    serializer_class = serializers.HookSerializer
    queryset = app_models.Hook
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(status=status.HTTP_201_CREATED)


class HookCommentsView(generics.ListAPIView):
    serializer_class = serializers.HookCommentsSerializer

    def get_queryset(self):
        hook_id = self.kwargs.get('hook_id')
        hook_obj = generics.get_object_or_404(app_models.Hook, pk=hook_id)
        return hook_obj.comments.all().order_by('-pk')


class HookCommentsCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = app_models.Comments
    serializer_class = serializers.HookCommentsSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        hook = serializer.validated_data.get('hook')
        qs = Notification.objects.filter(obj_id=hook.id, type='comment')

        if not qs.exists():
            Notification.objects.create(owner_id=hook.owner.id, type='comment', obj_id=hook.id, image=hook.image)
        return Response(status=status.HTTP_201_CREATED)


class CollectionView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer(self, *args, **kwargs):
        return serializers.CollectionSerializer(*args, **kwargs, remove_fields=['hooks'],
                                                context=self.get_serializer_context())

    def get_queryset(self):
        user = self.request.user
        return app_models.Collection.objects.filter(owner=user).order_by('-pk')


class CollectionActionView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.CollectionSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        user = self.request.user
        obj = generics.get_object_or_404(app_models.Collection, owner=user, pk=pk)
        return obj


class BookMarkActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):

        user = request.user
        pk = self.kwargs.get('hook_id')
        hook_obj: app_models.Hook = get_object_or_404(app_models.Hook, pk=pk)

        bookmarks_qs = hook_obj.bookmarks.filter(pk=user.id)
        if bookmarks_qs.exists():
            hook_obj.bookmarks.remove(user)
            return Response(data={
                'message': 'Bookmark Deleted'
            })
        else:
            hook_obj.bookmarks.add(user)
            return Response(
                data={
                    'message': 'Bookmarked this post'
                }
            )


class HookActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):

        hook_id = self.kwargs.get('hook_id')

        hook_obj = get_object_or_404(app_models.Hook, pk=hook_id)
        likes_qs = hook_obj.likes.filter(pk=request.user.id)

        if likes_qs.exists():
            hook_obj.likes.remove(request.user)
            return Response(data={
                'message': 'Like Deleted'
            })
        else:
            hook_obj.likes.add(request.user)
            likes_count = hook_obj.likes.count()

            if likes_count % 10 == 0 or likes_count == 1:
                Notification.objects.create(owner_id=hook_obj.owner_id, type='like', obj_id=hook_obj.id,
                                            image=hook_obj.image)

            return Response(
                data={
                    'message': 'Liked this post'
                }
            )


class IsAuthenticatedView(APIView):

    def get(self, request):
        user = request.user

        if user.is_authenticated:

            serializer_instance = serializers.UserDataAndInterestsSerializer(user, context={
                'request': request
            })

            return Response(data=serializer_instance.data)

        else:
            return Response(data={
                'message': 'unauthenticated'
            },
                status=status.HTTP_403_FORBIDDEN
            )


class TopInterestsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.InterestSerializer

    def get_queryset(self):
        top_interests_qs = cache.get('top_interests')
        if top_interests_qs is None:
            top_interests_qs = app_models.Interest.objects.annotate(total_hooks=models.Count('hook')). \
                                   order_by(-models.F('total_hooks'))[:6]
            cache.set('top_interests', top_interests_qs, 10800)
        return top_interests_qs


class UsersHookView(generics.ListAPIView):
    serializer_class = serializers.HookListSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return app_models.Hook.objects.filter(owner_id=user_id).order_by('-pk')


class GetBookmarks(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    serializer_class = serializers.HookListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = app_models.Hook.objects.filter(bookmarks=user)
        return qs


class GetHooksByInterest(generics.ListAPIView):
    serializer_class = serializers.HookListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        interest_name = self.kwargs.get('interest_name')
        # interest_obj = get_object_or_404(app_models.Interest, pk=interest_name)
        qs = app_models.Hook.objects.filter(related_interest__name=interest_name).order_by('-pk')
        # qs = interest_obj.hook_set.all()
        return qs


class HookSearchView(generics.ListAPIView):
    serializer_class = serializers.HookSearchSerializer
    filter_backends = [SearchFilter]
    search_fields = ['^title']
    queryset = app_models.Hook.objects.all()


class InterestSearchView(generics.ListAPIView):
    serializer_class = serializers.InterestSerializer
    search_fields = ['^name']
    queryset = app_models.Interest.objects.all()
    filter_backends = [SearchFilter]


class InterestSearchView2(generics.ListAPIView):
    serializer_class = serializers.InterestSerializer2
    queryset = app_models.Interest.objects.all()
    filter_backends = [SearchFilter]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_my_hooks(request, hook_id):
    hook_obj = get_object_or_404(app_models.Hook, pk=hook_id)
    try:
        add_to_users_pin(hook_obj, request.user)
        return Response({
            'message': 'Added to your hooks'
        }, status=status.HTTP_200_OK)
    except Exception as _:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# def get_hook_by_interests(request, interest_name):
#
#     context = {
#         'request': request
#     }
#     interest_obj = get_object_or_404(app_models.Interest, pk=interest_name)
#     serializer_instance = serializers.HookListSerializer(interest_obj, context=context)


class CollectionHooksView(generics.ListAPIView):
    serializer_class = serializers.HookListSerializer

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        obj: app_models.Collection = get_object_or_404(app_models.Collection, pk=pk)
        return obj.hook_set.all()


class UserCollectionsView(generics.ListAPIView):

    def get_serializer(self, *args, **kwargs):
        return serializers.CollectionSerializer(*args, **kwargs, remove_fields=['hooks'],
                                                context=self.get_serializer_context())

    def get_queryset(self):
        user_id = self.kwargs.get('pk')
        user = get_object_or_404(User, pk=user_id)
        return app_models.Collection.objects.filter(owner=user).order_by('-pk')


class ToggleInterest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        interest_name = request.data.get('interest_name')

        if interest_name is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        else:
            interest_obj: app_models.Interest = get_object_or_404(app_models.Interest, pk=interest_name)
            user = request.user
            if user.interests.filter(pk=interest_obj.pk).exists():
                user.interests.remove(interest_obj)
                return Response({
                    'message': 'Interest Removed'
                })
            else:
                user.interests.add(interest_obj)
                return Response({
                    'message': 'Interest Added'
                })


class ChangeHookCollection(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        hook_id = self.kwargs.get('hook_id')
        collection_id = request.data.get('collection_id')
        if collection_id is None:
            return Response({'message': 'Missing Collection ID'}, status=status.HTTP_400_BAD_REQUEST)

        hook_obj = get_object_or_404(app_models.Hook, pk=hook_id)

        collection_obj = get_object_or_404(app_models.Collection, pk=collection_id, owner=user)
        hook_obj.collection.add(collection_obj)
        return Response(status=status.HTTP_200_OK)
