import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateShipping = () => {
        const { email, firstName, lastName, phone, address, city, postalCode } = formData;
        if (!email || !firstName || !lastName || !phone || !address || !city || !postalCode) {
            alert("Please fill in all shipping details before continuing.");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && validateShipping()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { cardNumber, expiry, cvv } = formData;
        if (!cardNumber || !expiry || !cvv) {
            alert("Please fill in all payment details.");
            return;
        }

        try {
            const username = localStorage.getItem('username') || 'Guest';
            // First fetch cart items to get total (or calculate total from cart if possible)
            const cartRes = await axios.get("http://127.0.0.1:8000/api/cart/");
            const total = cartRes.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const orderData = {
                user: username,
                ...formData,
                total_price: total
            };

            await axios.post("http://127.0.0.1:8000/api/orders/", orderData);
            
            alert("Order Placed Successfully! Thank you for shopping with Fashion Store.");
            navigate('/');
        } catch (err) {
            console.error("Error placing order:", err);
            alert("Failed to place order. Please try again.");
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <h1>Secure Checkout</h1>
                    <div className="step-indicator">
                        <span className={step >= 1 ? 'active' : ''}>Shipping</span>
                        <span className={step >= 2 ? 'active' : ''}>Payment</span>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="checkout-form">
                    {step === 1 && (
                        <div className="checkout-step">
                            <h2>Shipping Information</h2>
                            <div className="form-row split">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-row split">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" placeholder="+1234567890" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-row split">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <button type="button" className="btn-next" onClick={nextStep}>Continue to Payment</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="checkout-step">
                            <h2>Payment Method</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-row split">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input type="text" name="cvv" placeholder="123" value={formData.cvv} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-back" onClick={prevStep}>Back</button>
                                <button type="submit" className="btn-submit">Finalize Order</button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Checkout;
