from rest_framework import serializers
from .models import Business, Product, Review

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'country',
            'state',
            'description',
            'hours'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        if Business.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        return Business.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance

class ProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(
        source='business.name', 
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'business',
            'business_name',
            'created_at'
        ]
        read_only_fields = ['business_name', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name', 
        read_only=True
    )
    business_name = serializers.CharField(
        source='product.business.name',
        read_only=True
    )
    business_id = serializers.IntegerField(
        source='product.business.id',
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'customer_name',
            'product',
            'product_name',
            'business_id',
            'business_name',
            'rating',
            'text',
            'sentiment',
            'is_fake',
            'reply',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'sentiment',
            'is_fake',
            'created_at',
            'updated_at',
            'product_name',
            'business_id',
            'business_name'
        ]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value