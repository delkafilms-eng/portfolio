import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; // We will create this

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Error al iniciar sesión: ' + err.message);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-box">
                <h2>Admin Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
