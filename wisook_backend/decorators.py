from django.http import HttpResponseRedirect


class AnonymousRequired(object):
    def __init__(self, view_function, redirect_url='/'):
        self.view_function = view_function
        self.redirect_url = redirect_url

    def __call__(self, request, *args, **kwargs):
        if request.user is not None and request.user.is_authenticated:
            return HttpResponseRedirect(self.redirect_url)
        return self.view_function(request, *args, **kwargs)
