from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import QuerySet

User = get_user_model()


class Interest(models.Model):
    name = models.CharField(max_length=20, primary_key=True)
    image = models.ImageField(upload_to='hooks/interests/images', null=True)


class HookLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tweet = models.ForeignKey("Hook", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)


# todo on_delete for FK(user)
class Comments(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    hook = models.ForeignKey('Hook', on_delete=models.CASCADE, related_name='comments')

    class Meta:
        verbose_name_plural = 'Comments'


class HookQuerySet(models.QuerySet):

    def weekly_picks(self, num_of_values):
        d = date.today() - timedelta(days=7)
        qs: QuerySet = self.filter(created_on__gte=d).order_by('-likes')[:num_of_values]
        return qs

    def feed(self, user: User):
        followers = user.following.values_list('usr_id')
        qs = self.filter(owner_id__in=followers)
        return qs


class HookManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return HookQuerySet(self.model, using=self._db)

    def get_weekly_picks(self, num_of_values=None):
        return self.get_queryset().weekly_picks(num_of_values)

    def get_user_feed(self, user: User):
        if user.is_authenticated:
            return self.get_queryset().feed(user)
        return self.none()


# TODO related_interest on_delete
# TODO while hosting replace localhost by current domain
class Hook(models.Model):
    objects = HookManager()

    title = models.CharField(max_length=200)
    name = models.CharField(max_length=50)
    description = models.TextField()
    image = models.URLField(default='http://localhost/media/defaults/default_hook_image.jpeg')
    url = models.URLField()

    likes = models.ManyToManyField(User, related_name='tweet_user', blank=True, through=HookLike)
    bookmarks = models.ManyToManyField(User, related_name='bookmarks', blank=True)
    related_interest = models.ForeignKey(Interest, on_delete=models.SET_NULL, null=True)
    created_on = models.DateField(auto_now_add=True)
    collection = models.ManyToManyField('Collection', blank=True)

    number_of_views = models.PositiveBigIntegerField(default=0, blank=True)
    number_of_pins = models.PositiveIntegerField(default=0, blank=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    @property
    def num_of_likes(self):
        return self.likes.count()


class Collection(models.Model):
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
