from django.db import migrations
from django.db.models import Q


CATEGORY_IMAGES = {
    'Books': '/images/books.jpg',
    'Electronics': '/images/electronics.jpg',
    'Hostel Essentials': '/images/hostel-essentials.jpg',
    'Cycles': '/images/cycles.jpg',
    'Sports': '/images/sports.jpg',
}
OLD_DEMO_IMAGES = (
    '/placeholder.svg',
    '/images/books.svg',
    '/images/electronics.svg',
    '/images/hostel-essentials.svg',
    '/images/cycles.svg',
    '/images/sports.svg',
)


def old_demo_image_filter(field):
    return Q(**{f'{field}__in': OLD_DEMO_IMAGES}) | Q(
        **{f'{field}__startswith': 'https://picsum.photos/seed/listing'}
    )


def use_stock_photos(apps, schema_editor):
    database = schema_editor.connection.alias
    Listing = apps.get_model('listings', 'Listing')
    OrderItem = apps.get_model('orders', 'OrderItem')

    for category, image_path in CATEGORY_IMAGES.items():
        Listing.objects.using(database).filter(
            old_demo_image_filter('imageUrl'),
            category=category,
        ).update(imageUrl=image_path)
        OrderItem.objects.using(database).filter(
            old_demo_image_filter('imageUrl'),
            listing__category=category,
        ).update(imageUrl=image_path)


class Migration(migrations.Migration):
    dependencies = [
        ('listings', '0004_update_listing_images'),
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(use_stock_photos, migrations.RunPython.noop),
    ]
