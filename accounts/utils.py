from typing import List

from django.db.models import Case, When, Model, QuerySet


def get_qs_in_order(my_model: Model, pk_list: List[int]) -> QuerySet:
    preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(pk_list)])
    queryset = my_model.objects.filter(pk__in=pk_list).order_by(preserved)
    return queryset
