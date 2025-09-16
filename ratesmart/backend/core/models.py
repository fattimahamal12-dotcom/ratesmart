from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from textblob import TextBlob
from collections import Counter
import re

class BusinessManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set 📧')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)


class Business(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    hours = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = BusinessManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone', 'country', 'state', 'hours']

    def _str_(self):
        return self.name


class Product(models.Model):
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"{self.name} ({self.business.name}) 📦"


class Review(models.Model):
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    customer_name = models.CharField(max_length=255)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField()
    sentiment = models.CharField(
        max_length=10,
        choices=SENTIMENT_CHOICES,
        default='neutral'
    )
    is_fake = models.BooleanField(default=False)
    reply = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def _str_(self):
        return f"{self.customer_name} - {self.product.name} ({self.rating}⭐)"

    def analyze_sentiment(self):
        """Perform sentiment analysis using TextBlob 😊"""
        analysis = TextBlob(self.text)
        polarity = analysis.sentiment.polarity
        if polarity > 0.15:
            return 'positive'
        elif polarity < -0.15:
            return 'negative'
        return 'neutral'

    def check_if_fake(self):
        """Automatic fake review detection with refined heuristics 🚩"""
        text_lower = self.text.lower().strip()
        words = re.findall(r'\b\w+\b', text_lower)
        word_count = len(words)

        
        if word_count < 3 and len(text_lower) < 10:
            return True

       
        if words:
            word_counts = Counter(words)
            most_common_count = word_counts.most_common(1)[0][1]
            if most_common_count > word_count * 0.8:
                return True

       
        if self.rating in [1, 5] and word_count < 3:
            return True

       
        suspicious_patterns = [
            r'http[s]?://\S+',
            r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
        ]
        for pattern in suspicious_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True

       
        return False

    def save(self, *args, **kwargs):
        """Auto-update sentiment and fake status before saving 📝"""
        self.sentiment = self.analyze_sentiment()
        self.is_fake = self.check_if_fake()
        super().save(*args, **kwargs)