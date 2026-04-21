import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getMediaUrl } from '../api';
import toast from 'react-hot-toast';
import './Cart.css';


const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            toast.error("Please login to view your cart.");
            navigate('/login');
            return;
        }
        fetchCart();
    }, [navigate]);

    const fetchCart = async () => {
        try {
            const response = await API.get("cart/");
            setCartItems(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setLoading(false);
        }
    };

    const updateQuantity = async (id, currentQty, delta) => {
        const newQty = currentQty + delta;
        
        try {
            await API.patch(`cart/${id}/`, {
                quantity: newQty
            });
            fetchCart(); 
        } catch (err) {
            console.error("Error updating quantity:", err);
        }
    };

    const removeItem = async (id) => {
        try {
            await API.delete(`cart/${id}/`);
            fetchCart();
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    if (loading) return <div className="loading">Reviewing Selection...</div>;

    return (
        <div className="cart-page">
            <header className="cart-header">
                <h1>Your Selection</h1>
                <p>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
            </header>

            <div className="cart-container">
                {cartItems.length > 0 ? (
                    <>
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-main">
                                        <div className="item-image">
                                            <img 
                                                src={getMediaUrl(item.image)}
                                                alt={item.product_name} 
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.product_name}</h3>
                                            <p className="item-price">${item.price}</p>
                                            <p className="item-selected-size">Size: <strong>{item.size}</strong></p>
                                            
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.id, item.quantity, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity, 1)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <p className="subtotal-item">${(item.price * item.quantity).toFixed(2)}</p>
                                        <button 
                                            className="remove-btn"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <aside className="cart-summary">
                            <h2>Summary</h2>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Complimentary</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <button 
                                className="checkout-btn"
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </button>

                        </aside>
                    </>
                ) : (
                    <div className="empty-cart">
                        <p>Your bag is currently empty.</p>
                        <a href="/" className="continue-shopping">Explore Collection</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
