from django.contrib import admin

from . import models

admin.site.register(
    [models.Hook,
     models.Interest,
     models.Comments,
     models.Collection,
     ]
)
