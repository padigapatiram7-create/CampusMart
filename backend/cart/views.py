from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from listings.models import Listing
from .models import Cart, CartItem


def get_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        cart = get_cart(request.user)
        items = []
        total = 0
        for item in cart.items.select_related('listing'):
            price = float(item.listing.price)
            total += price * item.quantity
            items.append({'id': item.id, 'listing': item.listing_id, 'listing_title': item.listing.title, 'listing_condition': item.listing.condition, 'listing_price': str(item.listing.price), 'quantity': item.quantity})
        return Response({'id': cart.id, 'items': items, 'total_items': sum(i['quantity'] for i in items), 'total_price': f'{total:.2f}'})


class AddToCartView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        cart = get_cart(request.user)
        listing = Listing.objects.filter(pk=request.data.get('listing')).first()
        if not listing:
            return Response({'detail': 'Listing not found'}, status=404)
        item, created = CartItem.objects.get_or_create(cart=cart, listing=listing)
        if not created:
            item.quantity += int(request.data.get('quantity', 1))
            item.save()
        else:
            item.quantity = int(request.data.get('quantity', 1))
            item.save()
        return Response({'message': 'Added to cart'}, status=201)


class CartItemView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, pk):
        item = CartItem.objects.filter(pk=pk, cart__user=request.user).first()
        if not item:
            return Response({'detail': 'Cart item not found'}, status=404)
        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return Response(status=200)

    def delete(self, request, pk):
        item = CartItem.objects.filter(pk=pk, cart__user=request.user).first()
        if not item:
            return Response({'detail': 'Cart item not found'}, status=404)
        item.delete()
        return Response(status=204)


class ClearCartView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        cart = get_cart(request.user)
        cart.items.all().delete()
        return Response(status=200)
