from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.FloatField()
    description = models.TextField()
    image = models.URLField()
    sizes = models.CharField(max_length=100, default="S,M,L,XL") # Available sizes

    def __str__(self):
        return self.name

class Cart(models.Model):
    product_name = models.CharField(max_length=200)
    price = models.FloatField()
    quantity = models.IntegerField(default=1)
    image = models.URLField(null=True, blank=True)
    size = models.CharField(max_length=10, default="M") # Selected size

    def __str__(self):
        return self.product_name

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Packed', 'Packed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
    )
    user = models.CharField(max_length=200) # For now, using username string
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    total_price = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.user}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    price = models.FloatField()
    size = models.CharField(max_length=10)
    image = models.URLField(null=True, blank=True)

class Notification(models.Model):
    user = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user}: {self.message}"