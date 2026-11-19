"""
URL configuration for campusmart project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
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
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, LogoutView, LoginView
from listings.views import ListingListView, ListingDetailView
from cart.views import CartView, AddToCartView, CartItemView, ClearCartView
from orders.views import CheckoutView, OrderListView, OrderDetailView, CancelOrderView
from sellers.views import SellerListingListView, SellerListingDetailView, SellerOrdersView, DashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/register/', RegisterView.as_view()),
    path('api/users/login/', LoginView.as_view()),
    path('api/users/logout/', LogoutView.as_view()),
    path('api/users/refresh/', TokenRefreshView.as_view()),
    path('api/listings/', ListingListView.as_view()),
    path('api/listings/<int:pk>/', ListingDetailView.as_view()),
    path('api/cart/', CartView.as_view()),
    path('api/cart/add/', AddToCartView.as_view()),
    path('api/cart/items/<int:pk>/', CartItemView.as_view()),
    path('api/cart/clear/', ClearCartView.as_view()),
    path('api/checkout/', CheckoutView.as_view()),
    path('api/orders/', OrderListView.as_view()),
    path('api/orders/<int:pk>/', OrderDetailView.as_view()),
    path('api/orders/<int:pk>/cancel/', CancelOrderView.as_view()),
    path('api/seller/listings/', SellerListingListView.as_view()),
    path('api/seller/listings/<int:pk>/', SellerListingDetailView.as_view()),
    path('api/seller/orders/', SellerOrdersView.as_view()),
    path('api/seller/dashboard/', DashboardView.as_view()),
]
