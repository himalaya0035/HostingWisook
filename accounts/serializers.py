from django.contrib.auth import get_user_model, login
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from accounts.models import Profile, HookUser

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    def __init__(self, *args, **kwargs):

        """
        :param kwargs: set remove_fields to dynamically remove default fields of serializer
        """

        remove_fields = kwargs.pop('remove_fields', None)

        super().__init__(*args, **kwargs)

        if remove_fields:
            for remove_field in remove_fields:
                self.fields.pop(remove_field)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        del ret['password']
        return ret

    def validate_password(self, password):

        if len(password) < 8:
            raise ValidationError()

        return password

    def validate_username(self, username):

        if len(username) < 6:
            raise ValidationError()

        return username

    def create(self, validated_data):
        user_obj = User.objects.create(
            email=validated_data['email'],
            full_name=validated_data['full_name']
        )
        user_obj.set_password(validated_data['password'])
        user_obj.save()
        login(self.context.get('request'), user_obj)
        return user_obj


class ProfileSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    def __init__(self):
        super(ProfileSerializer, self).__init__()

    class Meta:
        model = Profile
        fields = ['follower_count', 'following_count']

    def get_follower_count(self, instance: Profile):
        return instance.follower.all().count()

    def get_following_count(self, instance: Profile):
        return instance.user.following.all().count()


class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    is_following = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):

        remove_fields = kwargs.pop('remove_fields', None)
        super(UserProfileSerializer, self).__init__(*args, **kwargs)

        request = self.context.get('request')

        if not request.user.is_authenticated:
            self.fields.pop('is_following')

        if remove_fields:
            for remove_field in remove_fields:
                self.fields.pop(remove_field)

    class Meta:
        model = User
        fields = ['profile', 'id', 'email', 'full_name', 'prof_img', 'banner_img', 'credential',
                  'interests', 'is_following', 'is_owner']

    def get_is_following(self, instance: HookUser):
        request = self.context.get('request')

        p: Profile = instance.profile

        user = request.user
        if p.follower.filter(id=user.id).exists():
            return True
        return False

    def get_is_owner(self, instance: HookUser):
        current_user = self.context.get('request').user

        return current_user == instance


class UserListSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super(UserListSerializer, self).__init__(*args, **kwargs)

        request = self.context.get('request')

        if not request.user.is_authenticated:
            self.fields.pop('is_following')

    class Meta:
        model = User
        fields = ['id', 'full_name', 'credential', 'num_of_hooks',
                  'num_of_followers', 'num_of_following', 'prof_img', 'is_following']

    def get_is_following(self, instance: HookUser):

        request = self.context.get('request')

        p: Profile = instance.profile

        user = request.user
        if p.follower.filter(id=user.id).exists():
            return True
        return False


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        password = attrs.get('password')

        if len(password) <= 7:
            raise ValidationError('Password with length of 8 or more')

        return attrs


class FollowerOrFollowingSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        remove_fields = kwargs.pop('remove_fields', None)

        super(FollowerOrFollowingSerializer, self).__init__(*args, **kwargs)

        current_user = self.context.get('request').user

        if not current_user.is_authenticated:
            self.fields.pop('is_following')
        try:
            if remove_fields is not None:
                for remove_field in remove_fields:
                    self.fields.pop(remove_field)

        except KeyError as _:
            pass

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'prof_img',
            'credential',
            'is_following'
        ]

    def get_is_following(self, instance: HookUser):
        request = self.context.get('request')
        p: Profile = instance.profile

        user = request.user
        if p.follower.filter(id=user.id).exists():
            return True
        return False


"""

ful_name
prof_img
banner_img
credential
interests

"""


class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name']
