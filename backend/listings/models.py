from django.conf import settings
from django.db import models


class Listing(models.Model):
    title = models.CharField(max_length=200)
    hostel = models.CharField(max_length=100)
    condition = models.CharField(max_length=20, choices=(('Like New', 'Like New'), ('Good', 'Good'), ('Fair', 'Fair')))
    negotiable = models.BooleanField(default=False)
    category = models.CharField(max_length=30, choices=(('Books', 'Books'), ('Electronics', 'Electronics'), ('Hostel Essentials', 'Hostel Essentials'), ('Cycles', 'Cycles'), ('Sports', 'Sports')))
    price = models.DecimalField(max_digits=10, decimal_places=2)
    imageUrl = models.URLField(max_length=500)
    rating = models.FloatField(default=4.0)
    total_reviews = models.PositiveIntegerField(default=0)
    availability = models.CharField(max_length=20, default='Available')
    is_senior_deal = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
