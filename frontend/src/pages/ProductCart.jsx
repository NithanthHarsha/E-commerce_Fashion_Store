import axios from "axios";

function ProductCard({ product }) {

  const addToCart = async () => {

    const data = {
      product_name: product.name,
      price: product.price,
      quantity: 1
    };

    await axios.post(
      "http://127.0.0.1:8000/api/cart/add/",
      data
    );

    alert("Product added to cart");
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>

      <button onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;