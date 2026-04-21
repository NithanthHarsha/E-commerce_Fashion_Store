import React, { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Admin.css';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await API.get("orders/");
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading orders", err);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await API.patch(`orders/${orderId}/`, {
                status: newStatus
            });
            loadOrders();
            if (newStatus === 'Packed') {
                toast.success(`Order #${orderId} marked as Packed. The user will be notified.`);
            }
        } catch (err) {
            console.error("Error updating order status", err);
        }
    };

    if (loading) return <div className="loading">Fetching Orders...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Order Management</h1>
                <p>Manage customer orders and update shipping status</p>
            </header>

            <section className="admin-list-section">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <strong>{order.user}</strong><br />
                                        <small>{order.email}</small><br />
                                        <small>{order.phone}</small>
                                    </td>
                                    <td>${order.total_price}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{order.address}</td>
                                    <td>
                                        <div className="order-actions">
                                            {order.status === 'Pending' && (
                                                <button className="btn-edit" onClick={() => updateStatus(order.id, 'Accepted')}>Accept</button>
                                            )}
                                            {order.status === 'Accepted' && (
                                                <button className="btn-submit" style={{ padding: '0.6rem', fontSize: '0.7rem' }} onClick={() => updateStatus(order.id, 'Packed')}>Pack Order</button>
                                            )}
                                            {order.status === 'Packed' && (
                                                <button className="btn-edit" onClick={() => updateStatus(order.id, 'Shipped')}>Ship</button>
                                            )}
                                        </div>
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

export default ManageOrders;
