import API from "../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const addToCart = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
        toast.error("Please login to add items to the cart.");
        navigate('/login');
        return;
    }

    const data = {
      product_name: product.name,
      price: product.price,
      quantity: 1
    };

    await API.post(
      "cart/",
      data
    );

    toast.success("Product added to cart");
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