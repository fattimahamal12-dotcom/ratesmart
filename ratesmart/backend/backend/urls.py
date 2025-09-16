"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path 
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', views.signup_business, name='signup_business'),
    path('api/login/', views.login_business, name='login_business'),
    path('api/businesses/me/', views.current_business, name='current_business'),
    path('api/businesses/', views.business_list_create, name='business_list_create'),
    path('api/businesses/<int:pk>/', views.business_detail, name='business_detail'),
    path('api/products/', views.product_list_create, name='product_list_create'),
    path('api/products/<int:pk>/', views.product_detail, name='product_detail'),
    path('api/reviews/', views.review_list_create, name='review_list_create'),
    path('api/reviews/<int:pk>/', views.review_detail, name='review_detail'),
    path('api/admin/reset/', views.reset_system, name='reset_system'),
]

