from hook.models import Hook


def add_to_users_pin(hook_obj: Hook, user):
    hook_obj.number_of_pins += 1
    hook_obj.save()
    hook_obj.pk = None
    hook_obj.owner = user
    hook_obj._state.adding = True
    hook_obj.save()
    return hook_obj
