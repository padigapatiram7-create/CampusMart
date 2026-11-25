from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Listing
from .serializers import ListingSerializer


class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_fields = ('category', 'hostel', 'rating', 'is_senior_deal')
    search_fields = ('title', 'hostel')
    ordering_fields = ('price', 'rating')

    def get_queryset(self):
        qs = Listing.objects.all().order_by('id')
        rating = self.request.query_params.get('rating')
        if rating:
            try:
                qs = qs.filter(rating__gte=float(rating))
            except ValueError:
                pass
        if self.request.query_params.get('is_senior_deal') == 'true':
            if not self.request.user.is_authenticated:
                raise PermissionDenied('Login required for senior-only deals.')
            qs = qs.filter(is_senior_deal=True)
        return qs


class ListingDetailView(generics.RetrieveAPIView):
    serializer_class = ListingSerializer
    permission_classes = (permissions.AllowAny,)

    def get_object(self):
        listing = generics.get_object_or_404(Listing, pk=self.kwargs['pk'])
        if listing.is_senior_deal and not self.request.user.is_authenticated:
            raise PermissionDenied('Login required for senior-only deals.')
        return listing
