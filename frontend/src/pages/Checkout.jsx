import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const username = localStorage.getItem('username') || 'Guest';
            const cartRes = await API.get("cart/");
            const total = cartRes.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (total <= 0) {
                alert("Your cart is empty.");
                return;
            }

            const customerData = {
                user: username,
                email: formData.email,
                phone: formData.phone,
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode
            };

            if (paymentMethod === 'cod') {
                await API.post("orders/", {
                    ...customerData,
                    total_price: total,
                    payment_provider: 'cod',
                    is_paid: false
                });
                alert("Order placed with Cash on Delivery.");
                navigate('/');
                return;
            }

            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                alert("Razorpay SDK failed to load. Please check your internet and try again.");
                return;
            }

            const receipt = `fs_${Date.now()}`;
            const razorpayOrderResponse = await API.post(
                "payments/razorpay/create-order/",
                { amount: Math.round(total * 100), receipt }
            );

            const options = {
                key: razorpayOrderResponse.data.key,
                amount: razorpayOrderResponse.data.amount,
                currency: razorpayOrderResponse.data.currency,
                name: 'Fashion Store',
                description: 'Order Payment',
                order_id: razorpayOrderResponse.data.id,
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    contact: formData.phone
                },
                notes: {
                    address: `${formData.address}, ${formData.city}, ${formData.postalCode}`
                },
                handler: async function (response) {
                    try {
                        await API.post("payments/razorpay/verify/", {
                            ...response,
                            ...customerData
                        });
                        alert("Payment successful and order placed!");
                        navigate('/');
                    } catch (verifyError) {
                        console.error("Payment verification failed:", verifyError);
                        alert("Payment captured but order verification failed. Please contact support.");
                    }
                },
                theme: {
                    color: '#111111'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function () {
                alert("Payment failed. Please try again.");
            });
            razorpay.open();
        } catch (err) {
            console.error("Error initializing payment:", err);
            alert("Could not start Razorpay payment. Please try again.");
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
                            <div className="payment-options">
                                <button
                                    type="button"
                                    className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                >
                                    Razorpay (UPI / Card / Netbanking)
                                </button>
                                <button
                                    type="button"
                                    className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    Cash on Delivery
                                </button>
                            </div>
                            <p className="payment-note">
                                {paymentMethod === 'razorpay'
                                    ? "You will be redirected to Razorpay's secure payment window."
                                    : "Pay in cash when your order is delivered."}
                            </p>
                            <div className="form-row">
                                <button type="button" className="btn-next razorpay-btn">
                                    {paymentMethod === 'razorpay' ? 'Pay Securely with Razorpay' : 'Cash on Delivery Selected'}
                                </button>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-back" onClick={prevStep}>Back</button>
                                <button type="submit" className="btn-submit">
                                    {paymentMethod === 'razorpay' ? 'Proceed to Pay' : 'Place COD Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Checkout;
