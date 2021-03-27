from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserListSerializer
from . import models as app_models

User = get_user_model()


# num of views
class HookListSerializer(serializers.ModelSerializer):
    is_liked = serializers.SerializerMethodField(read_only=True)
    is_bookmarked = serializers.SerializerMethodField(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if not request.user.is_authenticated:
            self.fields.pop('is_liked')
            self.fields.pop('is_bookmarked')

    class Meta:
        model = app_models.Hook
        fields = ['id', 'title', 'image', 'url', 'is_liked', 'is_bookmarked',
                  ]

    def get_is_liked(self, instance: app_models.Hook):
        request = self.context.get('request')
        user: User = request.user
        return instance.likes.filter(pk=user.id).exists()

    def get_is_bookmarked(self, instance: app_models.Hook):
        request = self.context.get('request')
        user: User = request.user
        return instance.bookmarks.filter(id=user.id).exists()


class HookSerializer(HookListSerializer):
    owner_data = serializers.SerializerMethodField()
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    def __init__(self, *args, **kwargs):
        remove_fields = kwargs.pop('remove_fields', None)

        super(HookSerializer, self).__init__(*args, **kwargs)
        if remove_fields:
            for remove_field in remove_fields:
                self.fields.pop(remove_field)

    class Meta(HookListSerializer.Meta):
        fields = HookListSerializer.Meta.fields + ['description', 'url', 'created_on', 'number_of_views',
                                                   'related_interest', 'collection', 'owner_data', 'owner', 'name',
                                                   'num_of_likes', 'number_of_pins']

        read_only_fields = ['created_on',
                            'number_of_views',
                            'owner_data', ]

    def get_owner_data(self, instance: app_models.Hook):

        user = instance.owner
        curr_user = self.context.get('request').user

        return {
            **UserListSerializer(user, context=self.context).data,
            'is_owner': user == curr_user
        }


class HookCommentsSerializer(serializers.ModelSerializer):
    owner_data = serializers.SerializerMethodField()
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = app_models.Comments
        fields = [
            'owner',
            'id',
            'hook',
            'content',
            'owner_data',
        ]

    # data.owner_data.is_owner
    def get_owner_data(self, instance: app_models.Comments):
        user = instance.owner

        return {
            "prof_img": user.prof_img.url if user.prof_img else None,
            "full_name": user.full_name,
            "id": user.id,
        }


class CollectionSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    hooks = serializers.SerializerMethodField()
    num_of_hooks = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        remove_fields = kwargs.pop('remove_fields', None)

        super(CollectionSerializer, self).__init__(*args, **kwargs)
        if remove_fields:
            for remove_field in remove_fields:
                self.fields.pop(remove_field)

    class Meta:
        model = app_models.Collection
        fields = [
            'id',
            'title',
            'owner',
            'hooks',
            'num_of_hooks',
            'images'
        ]

    def get_hooks(self, instance: Meta.model):
        return HookListSerializer(instance.hook_set.all(), context=self.context, many=True).data

    def get_num_of_hooks(self, instance: app_models.Collection):
        return instance.hook_set.count()

    def get_images(self, instance: app_models.Collection):
        hooks = instance.hook_set.all().values_list('image', flat=True)[:4]
        return hooks


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Interest
        fields = [
            'name',
            'image',
        ]


class InterestSerializer2(InterestSerializer):
    is_fav = serializers.SerializerMethodField()

    class Meta:
        model = InterestSerializer.Meta.model
        fields = InterestSerializer.Meta.fields + ['is_fav']

    def get_is_fav(self, instance):
        user = self.context.get('request').user

        if user.is_authenticated:
            return user.interests.filter(pk=instance.pk).exists()
        else:
            return False


class UserDataAndInterestsSerializer(serializers.ModelSerializer):
    interests = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'prof_img',
            'credential',
            'interests'
        ]

    def get_interests(self, instance: User):
        return InterestSerializer(instance.interests.all(), many=True, context=self.context).data


class HookSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Hook
        fields = ['id', 'title']


class InterestSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Interest
        fields = ['name']


class ToggleFavInterests(serializers.Serializer):
    interest_name = serializers.CharField()
