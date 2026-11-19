from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Listing


class Command(BaseCommand):
    help = 'Seed demo CampusMart accounts and listings'

    def add_arguments(self, parser):
        parser.add_argument('--with-orders', action='store_true')

    def handle(self, *args, **options):
        User = get_user_model()
        priya, _ = User.objects.get_or_create(username='Priya', defaults={'email': 'priya@campusmart.local', 'user_type': 'seller'})
        priya.user_type = 'seller'
        priya.set_password('secret123')
        priya.save()
        arjun, _ = User.objects.get_or_create(username='Arjun', defaults={'email': 'arjun@campusmart.local', 'user_type': 'student'})
        arjun.user_type = 'student'
        arjun.set_password('secret123')
        arjun.save()

        if Listing.objects.count() >= 54:
            self.stdout.write(self.style.SUCCESS('CampusMart seed data already exists'))
            return

        categories = [('Books', 15), ('Electronics', 14), ('Hostel Essentials', 13), ('Cycles', 12), ('Sports', 0)]
        titles = {
            'Books': ['Engineering Mathematics Textbook Set', 'Data Structures Handbook', 'Modern Physics Notes', 'Economics for Beginners'],
            'Electronics': ['Scientific Calculator', 'Wireless Earbuds', 'Laptop Stand', 'Desk LED Lamp'],
            'Hostel Essentials': ['Study Table Lamp', 'Laundry Bag', 'Compact Iron', 'Water Kettle'],
            'Cycles': ['Campus Bicycle', 'Foldable Bicycle', 'Bicycle Helmet', 'Cycling Pump'],
            'Sports': ['Badminton Racket', 'Cricket Bat', 'Football', 'Yoga Mat'],
        }
        senior_ids = {9, 11, 18, 20, 42, 50}
        hostels = ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D']
        conditions = ['Like New', 'Good', 'Fair']
        index = 1
        for category, count in categories:
            for i in range(count):
                title_base = titles[category][i % len(titles[category])]
                Listing.objects.create(
                    title=f'{title_base} #{i + 1}',
                    hostel=hostels[i % len(hostels)],
                    condition=conditions[i % len(conditions)],
                    negotiable=i % 3 != 0,
                    category=category,
                    price=150 + i * 85 + (index % 7) * 25,
                    imageUrl='/placeholder.svg',
                    rating=round(3.5 + (i % 5) * 0.25, 1),
                    total_reviews=10 + i * 3,
                    availability='Available',
                    is_senior_deal=index in senior_ids,
                    description=f'A well-kept {title_base.lower()} available for campus meetup. Ideal for students and in ready-to-use condition.',
                    seller=priya,
                )
                index += 1
        self.stdout.write(self.style.SUCCESS('Seeded Priya, Arjun, and 54 listings'))
