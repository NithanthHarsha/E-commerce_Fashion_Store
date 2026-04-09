import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Login.css';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await API.post("login/", {
                username: formData.username,
                password: formData.password
            });
            
            if (response.data.message === "Login successful") {
                // Save user info and admin status to localStorage
                localStorage.setItem('username', formData.username);
                localStorage.setItem('is_admin', response.data.is_admin ? 'true' : 'false');
                
                // Update parent state
                if (onLogin) onLogin(formData.username, response.data.is_admin);
                
                // Redirect to home
                navigate('/');
            } else {
                setError(response.data.error || "Login failed.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p>Login to your account</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            placeholder="Enter your username"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-login">Login</button>
                </form>
                
                <div className="login-footer">
                    Don't have an account? <a href="/register">Register</a>
                </div>
            </div>
        </div>
    );
};

export default Login;