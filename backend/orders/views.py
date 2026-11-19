from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from cart.models import Cart
from .models import Order, OrderItem


class CheckoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'detail': 'Your cart is empty'}, status=400)
        data = request.data
        address = data.get('address', {})
        total = sum(float(i.listing.price) * i.quantity for i in cart.items.select_related('listing'))
        order = Order.objects.create(
            buyer=request.user,
            payment_method=data.get('payment_method', 'COD'),
            meetup_point=data.get('meetup_point', 'Main Gate'),
            address_full_name=address.get('full_name', ''),
            address_phone=address.get('phone', ''),
            address_line=address.get('address', ''),
            address_city=address.get('city', ''),
            address_state=address.get('state', ''),
            address_pincode=address.get('pincode', ''),
            total=total,
            is_paid=data.get('payment_method') == 'ONLINE',
        )
        for item in cart.items.select_related('listing'):
            listing = item.listing
            OrderItem.objects.create(order=order, listing=listing, seller=listing.seller, title=listing.title, hostel=listing.hostel, condition=listing.condition, imageUrl=listing.imageUrl, price=listing.price, quantity=item.quantity)
        cart.items.all().delete()
        return Response({'id': order.id, 'message': 'Order placed'}, status=201)


def order_payload(order):
    items = [{'id': i.id, 'listing': i.listing_id, 'title': i.title, 'hostel': i.hostel, 'condition': i.condition, 'imageUrl': i.imageUrl, 'price': str(i.price), 'quantity': i.quantity, 'status': i.status} for i in order.items.all()]
    return {'id': order.id, 'status': order.status, 'total': str(order.total), 'item_count': sum(i.quantity for i in order.items.all()), 'created_at': order.created_at, 'payment_method': order.payment_method, 'meetup_point': order.meetup_point, 'address': {'full_name': order.address_full_name, 'phone': order.address_phone, 'address': order.address_line, 'city': order.address_city, 'state': order.address_state, 'pincode': order.address_pincode}, 'items': items, 'can_cancel': order.status in ('placed', 'shipped')}


class OrderListView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
        return Response([order_payload(o) for o in orders])


class OrderDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        order = Order.objects.filter(pk=pk, buyer=request.user).first()
        if not order:
            return Response({'detail': 'Order not found'}, status=404)
        return Response(order_payload(order))


class CancelOrderView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        order = Order.objects.filter(pk=pk, buyer=request.user).first()
        if not order:
            return Response({'detail': 'Order not found'}, status=404)
        if order.status not in ('placed', 'shipped'):
            return Response({'detail': 'This order cannot be cancelled'}, status=400)
        order.status = 'cancelled'
        order.save()
        order.items.update(status='cancelled')
        return Response(order_payload(order))
