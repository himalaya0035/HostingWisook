from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12


class CommentsPagination(PageNumberPagination):
    page_size = 20
