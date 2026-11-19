from django.conf import settings
from django.db import models


class Order(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    payment_method = models.CharField(max_length=20)
    meetup_point = models.CharField(max_length=30)
    address_full_name = models.CharField(max_length=100)
    address_phone = models.CharField(max_length=20)
    address_line = models.CharField(max_length=200)
    address_city = models.CharField(max_length=100)
    address_state = models.CharField(max_length=100)
    address_pincode = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='placed')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    listing = models.ForeignKey('listings.Listing', on_delete=models.SET_NULL, null=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sold_items')
    title = models.CharField(max_length=200)
    hostel = models.CharField(max_length=100)
    condition = models.CharField(max_length=20)
    imageUrl = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, default='placed')
