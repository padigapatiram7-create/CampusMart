from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    user_type = models.CharField(max_length=10, choices=(('student', 'Student'), ('seller', 'Seller')), default='student')
