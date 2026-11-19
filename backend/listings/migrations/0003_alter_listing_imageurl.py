from django.db import migrations, models


def use_placeholder(apps, schema_editor):
    Listing = apps.get_model('listings', 'Listing')
    Listing.objects.filter(imageUrl__startswith='http').update(imageUrl='/placeholder.svg')


class Migration(migrations.Migration):
    dependencies = [
        ('listings', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='imageUrl',
            field=models.CharField(max_length=3000000),
        ),
        migrations.RunPython(use_placeholder, migrations.RunPython.noop),
    ]
