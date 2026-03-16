import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api';
import './Admin.css';


const Admin = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await fetchProducts();
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading products", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        
        // Only append file if a new one was selected
        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        try {
            if (editingId) {
                await updateProduct(editingId, data);
            } else {
                await createProduct(data);
            }
            setFormData({ name: '', price: '', description: '', image: '' });
            setEditingId(null);
            loadProducts();
        } catch (err) {
            console.error("Error saving product", err);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image // This will be a URL string
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (err) {
                console.error("Error deleting product", err);
            }
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Product Management</h1>
                <p>Add, edit or remove products from the store</p>
            </header>

            <section className="admin-form-section">
                <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Product Name" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="Price" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="file-label">Product Image:</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                            required={!editingId}
                        />
                        {editingId && formData.image && typeof formData.image === 'string' && (
                            <small className="existing-img-hint">Currently: {formData.image.split('/').pop()}</small>
                        )}
                    </div>
                    <div className="form-group">
                        <textarea 
                            placeholder="Description" 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingId ? "Update Product" : "Save Product"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', price: '', description: '', image: '' });
                            }}>Cancel</button>
                        )}
                    </div>
                </form>
            </section>

            <section className="admin-list-section">
                <h2>Existing Products</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img 
                                            src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`} 
                                            alt={product.name} 
                                            className="admin-thumb" 
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>${product.price}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Admin;
