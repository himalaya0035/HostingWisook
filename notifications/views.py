from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_notifs(request):
    user = request.user
    qs = Notification.objects.filter(owner=user).order_by('-pk')
    data = NotificationSerializer(qs, many=True)
    return Response(data.data)
