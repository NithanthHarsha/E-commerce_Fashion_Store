from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0010_order_is_paid_order_stripe_payment_intent_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_provider',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='razorpay_order_id',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='razorpay_payment_id',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
