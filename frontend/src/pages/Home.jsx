import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({}); // Track size per product
    const navigate = useNavigate();

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await fetchProducts();
                setProducts(response.data);

                // Initialize default sizes (first size available)
                const defaults = {};
                response.data.forEach(p => {
                    const sizeList = p.sizes ? p.sizes.split(',') : ['S', 'M', 'L', 'XL'];
                    defaults[p.id] = sizeList[0];
                });
                setSelectedSizes(defaults);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please check if the backend is running.");
                setLoading(false);
            }
        };

        getProducts();
    }, []);

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    const handleQuickAdd = async (product) => {
        const data = {
            product_name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            size: selectedSizes[product.id] || 'M'
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/cart/", data);
            navigate('/cart');
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Could not add to cart. Is the backend running?");
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="spinner"></div>
            <span>Curating Collection...</span>
        </div>
    );

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-container">
            <header className="hero-section">
                <div className="hero-image-container">
                    <video
                        className="hero-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        disablePictureInPicture
                        disableRemotePlayback
                    >
                        <source src="/fashion.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="hero-content">
                    <span>Spring / Summer 2025</span>
                    <h1>The Art of Elegance</h1>
                    <a href="#collection" className="hero-btn">Explore Collection</a>
                </div>
            </header>

            <section id="collection" className="section-title">
                <h2>New Arrivals</h2>
            </section>

            <div className="product-grid">
                {products.length > 0 ? (
                    products.map((product) => {
                        const sizes = product.sizes ? product.sizes.split(',') : ['S', 'M', 'L', 'XL'];
                        return (
                            <div key={product.id} className="product-card">
                                <div className="product-image-wrapper">
                                    <img src={product.image} alt={product.name} />
                                    <button
                                        className="quick-add"
                                        onClick={() => handleQuickAdd(product)}
                                    >
                                        Quick Add +
                                    </button>
                                </div>
                                <div className="product-card-info">
                                    <h3>{product.name}</h3>
                                    <p className="price">${product.price}</p>

                                    {/* Size Selection */}
                                    <div className="size-selector-home">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                className={`size-btn ${selectedSizes[product.id] === size ? 'active' : ''}`}
                                                onClick={() => handleSizeSelect(product.id, size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-products">
                        <p>Our curated selection is arriving soon.</p>
                    </div>
                )}
            </div>

            <section className="editorial-callout" style={{
                background: 'var(--bg-stone)',
                padding: '8rem 4rem',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display' }}>Craftsmanship First</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)', lineHeight: '2' }}>
                    Every piece in our collection is selected for its timeless design and exceptional quality.
                    We believe in slow fashion that lasts a lifetime.
                </p>
            </section>
        </div>
    );
};

export default Home;