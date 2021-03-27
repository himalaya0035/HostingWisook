from django.core.management.base import BaseCommand

from hook.management.constants import default_interests
from hook.models import Interest


class Command(BaseCommand):
    help = "create default Interest Objects"

    def handle(self, *args, **options):
        objs = [Interest(name=default_interest_name) for default_interest_name in default_interests]
        Interest.objects.bulk_create(objs)
