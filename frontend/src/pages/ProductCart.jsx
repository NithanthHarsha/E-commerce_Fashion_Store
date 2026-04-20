import API from "../api";

function ProductCard({ product }) {

  const addToCart = async () => {

    const data = {
      product_name: product.name,
      price: product.price,
      quantity: 1
    };

    await API.post(
      "cart/",
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