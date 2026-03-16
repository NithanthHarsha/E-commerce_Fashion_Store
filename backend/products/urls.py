from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.product_list),
    path('products/<int:pk>/', views.product_detail),
    path('cart/', views.view_cart),
    path('cart/<int:pk>/', views.delete_cart_item),
    path('orders/', views.manage_orders),
    path('orders/<int:pk>/', views.update_order_status),
    path('notifications/<str:username>/', views.user_notifications),
    path('notifications/<int:pk>/detail/', views.notification_detail),
    path('register/', views.register_user),
    path('login/', views.login_user),
]