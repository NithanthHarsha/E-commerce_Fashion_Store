from django.contrib import admin
from .models import Product, Cart

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'price', 'quantity')
