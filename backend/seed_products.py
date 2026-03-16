import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashion_store.settings')
django.setup()

from products.models import Product

def seed_products():
    # Clear existing
    Product.objects.all().delete()

    # 5 Men's Shirts with high-reliability Unsplash IDs
    shirts = [
        ("Premium White Linen Shirt", 3490.00, "Breathable 100% linen shirt for ultimate summer comfort.", 
         "https://images.unsplash.com/photo-1626497748470-284d81f5f1d4?auto=format&fit=crop&w=800&q=80"),
        
        ("Midnight Navy Polo", 1990.00, "Clean, sharp navy polo shirt in premium piqué cotton.", 
         "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80"),
        
        ("Eclipse Black Denim", 4290.00, "Rugged yet refined black denim shirt with metal buttons.", 
         "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"),
        
        ("Azure Striped Oxford", 2790.00, "Timeless light blue and white striped oxford shirt.", 
         "https://images.unsplash.com/photo-1596755094514-f87034a26cc1?auto=format&fit=crop&w=800&q=80"),
        
        ("Classic Sage Button-Down", 2990.00, "Versatile sage green shirt in soft brushed cotton.", 
         "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=800&q=80")
    ]

    for name, price, desc, img in shirts:
        Product.objects.create(
            name=name,
            price=price,
            description=desc,
            image=img,
            sizes='S,M,L,XL'
        )

    print(f"Successfully updated 5 Men's shirts with stable images.")

if __name__ == '__main__':
    seed_products()
