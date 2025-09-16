from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .models import Business, Product, Review
from .serializers import BusinessSerializer, ProductSerializer, ReviewSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import BasePermission


def _extract_bearer_token(request):
    """Return the token string from Authorization header, tolerate formats.
    Accepts: 'Bearer xxx', 'bearer xxx', or raw 'admin-token'.
    """
    auth_header = request.headers.get('Authorization', '') or request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header:
        return ''
    parts = auth_header.split(' ')
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return auth_header.strip()


def _is_admin(request):
    token = _extract_bearer_token(request)
    return token == 'admin-token'

class AllowAnyOrAdminToken(BasePermission):
    """
    Allow access to any user or admin token
    """
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            if token == 'admin-token':
                return True
        
        if not request.user or request.user.is_anonymous:
            return True
        
        return True

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_business(request):
    data = request.data.copy()
    required_fields = ['name', 'email', 'password', 'phone', 'country', 'state', 'hours']
    if not all(field in data for field in required_fields):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = BusinessSerializer(data=data)
    if serializer.is_valid():
        business = Business.objects.create_user(
            email=data['email'],
            name=data['name'],
            password=data['password'],
            phone=data['phone'],
            country=data['country'],
            state=data['state'],
            hours=data['hours'],
            description=data.get('description', '')
        )
        
        refresh = RefreshToken.for_user(business)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'business': BusinessSerializer(business).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_business(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        business = Business.objects.get(email=email)
        if business.check_password(password):
            refresh = RefreshToken.for_user(business)
            serializer = BusinessSerializer(business)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'business': serializer.data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Business.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_business(request):
    serializer = BusinessSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def business_list_create(request):
    if request.method == 'GET':
        businesses = Business.objects.all()
        serializer = BusinessSerializer(businesses, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = BusinessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def business_detail(request, pk):
    try:
        business = Business.objects.get(pk=pk)
        if request.method == 'GET':
            serializer = BusinessSerializer(business)
            return Response(serializer.data)
        elif request.method == 'PUT':
            if not (_is_admin(request) or (hasattr(request, 'user') and business == request.user)):
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = BusinessSerializer(business, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE':
            if not (_is_admin(request) or (hasattr(request, 'user') and business == request.user)):
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            business.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list_create(request):
    if request.method == 'GET':
        
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        if request.method == 'GET':
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE':
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def review_list_create(request):
    if request.method == 'GET':
        business_id = request.query_params.get('business_id')
        if business_id:
            reviews = Review.objects.filter(product__business_id=business_id)
        else:
            reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def review_detail(request, pk):
    try:
        review = Review.objects.get(pk=pk)
        if request.method == 'GET':
            serializer = ReviewSerializer(review)
            return Response(serializer.data)
        elif request.method == 'PUT':
            if _is_admin(request):
                serializer = ReviewSerializer(review, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            if hasattr(request, 'user') and getattr(request.user, 'id', None) is not None:
                business_user = request.user
                if review.product.business_id == business_user.id:
                    allowed_data = {}
                    if 'reply' in request.data:
                        allowed_data['reply'] = request.data['reply']
                    else:
                        return Response({'error': 'Only reply can be updated by business'}, status=status.HTTP_400_BAD_REQUEST)

                    serializer = ReviewSerializer(review, data=allowed_data, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data)
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        elif request.method == 'DELETE':
            if not _is_admin(request):
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            review.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])  
def reset_system(request):
    if not _is_admin(request):
        return Response({'error': 'Invalid admin token'}, status=status.HTTP_403_FORBIDDEN)

    try:
        
        Review.objects.all().delete()
        Product.objects.all().delete()
        Business.objects.exclude(is_superuser=True).delete()

        return Response({'message': 'System reset successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error resetting system: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
