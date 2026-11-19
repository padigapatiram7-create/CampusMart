from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from listings.models import Listing
from listings.serializers import ListingSerializer
from orders.models import OrderItem


def seller_required(request):
    if request.user.user_type != 'seller':
        return Response({'detail': 'Seller access required'}, status=403)
    return None


class SellerListingListView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        denied = seller_required(request)
        if denied:
            return denied
        qs = Listing.objects.filter(seller=request.user)
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)
        return Response({'count': qs.count(), 'results': ListingSerializer(qs, many=True).data})

    def post(self, request):
        denied = seller_required(request)
        if denied:
            return denied
        serializer = ListingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listing = serializer.save(seller=request.user)
        return Response(ListingSerializer(listing).data, status=201)


class SellerListingDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_listing(self, request, pk):
        if request.user.user_type != 'seller':
            return None
        return Listing.objects.filter(pk=pk, seller=request.user).first()

    def get(self, request, pk):
        listing = self.get_listing(request, pk)
        if not listing:
            return Response({'detail': 'Listing not found or not yours'}, status=404)
        return Response(ListingSerializer(listing).data)

    def patch(self, request, pk):
        listing = self.get_listing(request, pk)
        if not listing:
            return Response({'detail': 'Listing not found or not yours'}, status=404)
        serializer = ListingSerializer(listing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        listing = self.get_listing(request, pk)
        if not listing:
            return Response({'detail': 'Listing not found or not yours'}, status=404)
        listing.delete()
        return Response(status=204)


class SellerOrdersView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        return self.patch(request)

    def get(self, request):
        if request.user.user_type != 'seller':
            return Response({'detail': 'Seller access required'}, status=403)
        items = OrderItem.objects.filter(seller=request.user).select_related('order').order_by('-order__created_at')
        data = [{'id': i.id, 'order_id': i.order_id, 'listing': i.title, 'quantity': i.quantity, 'amount': str(float(i.price) * i.quantity), 'status': i.status} for i in items]
        return Response(data)

    def patch(self, request):
        if request.user.user_type != 'seller':
            return Response({'detail': 'Seller access required'}, status=403)
        item_id = request.query_params.get('item')
        item = OrderItem.objects.filter(id=item_id, seller=request.user).first()
        if not item:
            return Response({'detail': 'Order item not found'}, status=404)
        next_status = {'placed': 'shipped', 'shipped': 'delivered', 'delivered': 'delivered', 'cancelled': 'cancelled'}[item.status]
        item.status = next_status
        item.save()
        order = item.order
        if order.items.exclude(status='delivered').exclude(status='cancelled').exists() is False:
            if not order.items.filter(status='cancelled').exists():
                order.status = 'delivered'
                order.is_paid = True
                order.save()
        return Response({'id': item.id, 'status': item.status})


class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.user_type != 'seller':
            return Response({'detail': 'Seller access required'}, status=403)
        items = OrderItem.objects.filter(seller=request.user)
        today = timezone.now().date()
        chart = []
        for offset in range(6, -1, -1):
            day = today - timedelta(days=offset)
            amount = sum(float(i.price) * i.quantity for i in items.filter(order__created_at__date=day))
            chart.append({'label': day.strftime('%a'), 'value': round(amount, 2)})
        top = items.values('title').annotate(sold=Sum('quantity'), amount=Sum('price')).order_by('-sold')[:5]
        statuses = list(items.values('status').annotate(count=Count('id')))
        still = items.exclude(status__in=('delivered', 'cancelled')).aggregate(count=Count('id'))['count'] or 0
        return Response({
            'cards': {'sales': sum(float(i.price) * i.quantity for i in items), 'orders': items.values('order').distinct().count(), 'still_to_handover': still, 'listings': Listing.objects.filter(seller=request.user).count()},
            'still_to_handover': still,
            'chart': chart,
            'top_listings': [{'title': i['title'], 'sold': i['sold'], 'amount': float(i['amount'] or 0)} for i in top],
            'status_counts': statuses,
        })
