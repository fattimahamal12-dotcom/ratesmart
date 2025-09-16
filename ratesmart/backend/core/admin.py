from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Business, Product, Review

class BusinessAdmin(UserAdmin):
    list_display = ('name', 'email', 'phone', 'country', 'state', 'is_active', 'is_staff')
    search_fields = ('name', 'email')
    ordering = ('name',)
    filter_horizontal = ('groups', 'user_permissions')
    list_filter = ('is_active', 'is_staff')
    
    fieldsets = (
        (None, {'fields': ('email', 'password', 'name', 'phone', 'country', 'state', 'hours', 'description')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'country', 'state', 'hours', 'description', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ()

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'business')
    list_filter = ('business',)
    search_fields = ('name',)

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'product', 'rating', 'text', 'sentiment', 'is_fake', 'created_at')
    list_filter = ('sentiment', 'is_fake', 'rating', 'created_at')
    search_fields = ('customer_name', 'product__name', 'text')
    readonly_fields = ('sentiment', 'is_fake', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('customer_name', 'product', 'rating', 'text')
        }),
        ('Analysis', {
            'fields': ('sentiment', 'is_fake'),
        }),
        ('Business Reply', {
            'fields': ('reply',),
        }),
    )

admin.site.register(Business, BusinessAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Review, ReviewAdmin)