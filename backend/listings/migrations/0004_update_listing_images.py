from django.db import migrations


CATEGORY_IMAGES = {
    'Books': '/images/books.svg',
    'Electronics': '/images/electronics.svg',
    'Hostel Essentials': '/images/hostel-essentials.svg',
    'Cycles': '/images/cycles.svg',
    'Sports': '/images/sports.svg',
}


def update_listing_images(apps, schema_editor):
    database = schema_editor.connection.alias
    Listing = apps.get_model('listings', 'Listing')
    OrderItem = apps.get_model('orders', 'OrderItem')

    for category, image_path in CATEGORY_IMAGES.items():
        Listing.objects.using(database).filter(
            category=category,
            imageUrl__in=('/placeholder.svg', ''),
        ).update(imageUrl=image_path)
        OrderItem.objects.using(database).filter(
            listing__category=category,
            imageUrl__in=('/placeholder.svg', ''),
        ).update(imageUrl=image_path)


class Migration(migrations.Migration):
    dependencies = [
        ('listings', '0003_alter_listing_imageurl'),
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(update_listing_images, migrations.RunPython.noop),
    ]
