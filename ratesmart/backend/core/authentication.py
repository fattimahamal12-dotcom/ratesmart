from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser

class AdminTokenAuthentication(BaseAuthentication):
    """
    Custom authentication for admin operations using simple token
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        if token == 'admin-token':
            return (AnonymousUser(), token)
            
        return None
    
    def authenticate_header(self, request):
        return 'Bearer'
