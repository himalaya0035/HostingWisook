from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.db.models.signals import post_save


# from notifications.utils import create_notification


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password, is_active=True, is_staff=False, is_admin=False):
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("Users must have a password")
        user_obj = self.model(
            email=self.normalize_email(email),
            full_name=full_name
        )
        user_obj.set_password(password)
        user_obj.staff = is_staff
        user_obj.admin = is_admin
        user_obj.active = is_active
        user_obj.save(using=self._db)
        return user_obj

    def create_staffuser(self, email, full_name=None, password=None):
        user = self.create_user(
            email,
            full_name=full_name,
            password=password,
            is_staff=True
        )
        return user

    def create_superuser(self, email, full_name=None, password=None):
        user = self.create_user(
            email,
            full_name=full_name,
            password=password,
            is_staff=True,
            is_admin=True
        )
        return user


class HookUser(AbstractBaseUser):
    providers = (
        ('Google', 'Google'),
        ('Facebook', 'Facebook')
    )

    email = models.EmailField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True, default='User')
    is_active = models.BooleanField(default=True)
    staff = models.BooleanField(default=False)
    admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    prof_img = models.ImageField(blank=True, upload_to='accounts/profile_img',
                                 default='defaults/default_profile_image.jpeg')
    banner_img = models.ImageField(blank=True, upload_to='accounts/banner_img',
                                   default='defaults/default_banner_image.jpeg')
    credential = models.CharField(max_length=50, default='Wisook User')

    interests = models.ManyToManyField(to='hook.Interest')

    provider = models.CharField(
        choices=providers,
        max_length=8,
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return self.full_name

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.staff

    @property
    def is_admin(self):
        return self.admin

    @property
    def num_of_hooks(self):
        return self.hook_set.count()

    @property
    def num_of_followers(self):
        return self.profile.follower.count()

    @property
    def num_of_following(self):
        return self.following.count()


def auto_prof_create(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


User = get_user_model()


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    follower = models.ManyToManyField(User, blank=True, related_name='following')

    def __str__(self):
        return self.user.full_name


post_save.connect(auto_prof_create, sender=User)
# post_save.connect(create_notification, sender=User)

# qs = HookUser.objects.all().annotate(followers_sum=models.Sum('following'),
#                                      following_sum=models.Sum(models.Subquery(
#                                          Profile.objects.filter(user_id=models.OuterRef('id')).annotate(
#                                              followers_sum=models.Sum('follower')).values('followers_sum')
#                                      )))
# Profile.objects.filter(follower__in=)
# wo profile aayengi jo isko follow krti hai

# HookUser.objects.filter(profile=)
