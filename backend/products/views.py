from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import hashlib
import hmac
import json
import os
import base64
from urllib import error, request as urllib_request
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Cart, Order, OrderItem, Notification
from .serializers import ProductSerializer, CartSerializer, OrderSerializer, NotificationSerializer

def create_order_placed_notification(order, cart_items):
    item_names = [item.product_name for item in cart_items]
    short_item_list = ", ".join(item_names[:3])
    if len(item_names) > 3:
        short_item_list += f" +{len(item_names) - 3} more"

    order_time = order.created_at.strftime("%d %b %Y, %I:%M %p")
    message = (
        f"Order placed successfully at {order_time}. "
        f"Items: {short_item_list}. "
        f"Total: Rs. {order.total_price:.2f}."
    )

    Notification.objects.create(
        user=order.user,
        message=message
    )

@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if password != confirm_password:
        return Response({"error": "Passwords do not match!"}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists!"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({
            "message": "Login successful",
            "username": user.username,
            "is_admin": user.is_staff
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'POST'])
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.all().order_by('-id')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # For PUT/PATCH with FormData, DRF handles files in request.data
        serializer = ProductSerializer(product, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def view_cart(request):
    if request.method == 'GET':
        cart_items = Cart.objects.all()
        serializer = CartSerializer(cart_items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CartSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', 'PATCH'])
def delete_cart_item(request, pk):
    try:
        item = Cart.objects.get(pk=pk)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'PATCH':
        serializer = CartSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if serializer.data['quantity'] <= 0:
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Orders Views
@api_view(['GET', 'POST'])
def manage_orders(request):
    if request.method == 'GET':
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        # Create Order from Cart data
        data = request.data
        cart_items = Cart.objects.all()
        payment_provider = (data.get('payment_provider') or 'cod').lower()
        is_paid = bool(data.get('is_paid', False))
        
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
            
        order = Order.objects.create(
            user=data.get('user', 'Guest'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=f"{data.get('address')}, {data.get('city')}, {data.get('postalCode')}",
            total_price=data.get('total_price', 0),
            payment_provider=payment_provider,
            is_paid=is_paid
        )
        
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_name=item.product_name,
                quantity=item.quantity,
                price=item.price,
                size=item.size,
                image=item.image
            )
        
        create_order_placed_notification(order, cart_items)
        cart_items.delete() # Empty cart after order
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    old_status = order.status
    serializer = OrderSerializer(order, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        new_status = serializer.data['status']
        
        # Create notification if status changed to Packed
        if old_status != 'Packed' and new_status == 'Packed':
            Notification.objects.create(
                user=order.user,
                message=f"Your order #{order.id} has been packed and is being prepared for shipment!"
            )
            
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Notifications View
@api_view(['GET'])
def user_notifications(request, username):
    notifications = Notification.objects.filter(user=username).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PATCH', 'DELETE'])
def notification_detail(request, pk):
    try:
        notification = Notification.objects.get(pk=pk)
    except Notification.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def create_razorpay_order(request):
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
        return Response(
            {"error": "Razorpay credentials are not configured on the server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    amount = int(request.data.get("amount", 0))
    if amount <= 0:
        return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"receipt_{request.data.get('receipt', 'order')}"
    }

    basic_auth = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("utf-8")
    headers = {
        "Authorization": f"Basic {basic_auth}",
        "Content-Type": "application/json"
    }
    request_body = json.dumps(payload).encode("utf-8")

    try:
        req = urllib_request.Request(
            "https://api.razorpay.com/v1/orders",
            data=request_body,
            headers=headers,
            method="POST"
        )
        with urllib_request.urlopen(req, timeout=15) as response:
            order_data = json.loads(response.read().decode("utf-8"))
        return Response(
            {
                "id": order_data.get("id"),
                "amount": order_data.get("amount"),
                "currency": order_data.get("currency"),
                "key": key_id
            },
            status=status.HTTP_201_CREATED
        )
    except error.HTTPError as exc:
        details = exc.read().decode("utf-8")
        return Response(
            {"error": "Failed to create Razorpay order.", "details": details},
            status=status.HTTP_502_BAD_GATEWAY
        )
    except error.URLError as exc:
        return Response(
            {"error": "Failed to create Razorpay order.", "details": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY
        )


@api_view(['POST'])
def verify_razorpay_payment(request):
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_secret:
        return Response(
            {"error": "Razorpay secret is not configured on the server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    razorpay_order_id = request.data.get("razorpay_order_id")
    razorpay_payment_id = request.data.get("razorpay_payment_id")
    razorpay_signature = request.data.get("razorpay_signature")

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return Response({"error": "Missing Razorpay payment details."}, status=status.HTTP_400_BAD_REQUEST)

    generated_signature = hmac.new(
        key_secret.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != razorpay_signature:
        return Response({"error": "Payment signature verification failed."}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    cart_items = Cart.objects.all()

    if not cart_items.exists():
        return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

    total_price = sum(item.price * item.quantity for item in cart_items)
    user = data.get('user', 'Guest')

    order = Order.objects.create(
        user=user,
        email=data.get('email'),
        phone=data.get('phone'),
        address=f"{data.get('address')}, {data.get('city')}, {data.get('postalCode')}",
        total_price=total_price,
        is_paid=True,
        payment_provider='razorpay',
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price,
            size=item.size,
            image=item.image
        )

    create_order_placed_notification(order, cart_items)
    cart_items.delete()
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
