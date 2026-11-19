from django.db import migrations


PRODUCT_IMAGES = {
    'Engineering Mathematics Textbook Set': '/images/books-engineering.jpg',
    'Data Structures Handbook': '/images/books-data-structures.jpg',
    'Modern Physics Notes': '/images/books-physics.jpg',
    'Economics for Beginners': '/images/books-economics.jpg',
    'Scientific Calculator': '/images/electronics-calculator.jpg',
    'Wireless Earbuds': '/images/electronics-earbuds.jpg',
    'Laptop Stand': '/images/electronics-laptop-stand.jpg',
    'Desk LED Lamp': '/images/electronics-desk-lamp.jpg',
    'Study Table Lamp': '/images/hostel-study-lamp.jpg',
    'Laundry Bag': '/images/hostel-laundry-bag.jpg',
    'Compact Iron': '/images/hostel-iron.jpg',
    'Water Kettle': '/images/hostel-kettle.jpg',
    'Campus Bicycle': '/images/cycles-city-bike.jpg',
    'Foldable Bicycle': '/images/cycles-folding-bike.jpg',
    'Bicycle Helmet': '/images/cycles-helmet.jpg',
    'Cycling Pump': '/images/cycles-pump.jpg',
}


def use_product_images(apps, schema_editor):
    database = schema_editor.connection.alias
    Listing = apps.get_model('listings', 'Listing')
    OrderItem = apps.get_model('orders', 'OrderItem')

    for title, image_path in PRODUCT_IMAGES.items():
        Listing.objects.using(database).filter(title__startswith=title).update(
            imageUrl=image_path,
        )
        OrderItem.objects.using(database).filter(
            listing__title__startswith=title,
        ).update(imageUrl=image_path)


class Migration(migrations.Migration):
    dependencies = [
        ('listings', '0005_use_stock_photos'),
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(use_product_images, migrations.RunPython.noop),
    ]
