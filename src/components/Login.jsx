import React from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase';
import logo from '../assets/LOGO_TABRUSH-removebg.png';

const Login = ({ onLogin }) => {

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (error) {
            console.error("Login Failed:", error);
            alert("Login Failed: " + error.message);
        }
    };

    return (
        <div className="menu landing-screen">
            <img src={logo} alt="TabRush Logo" className="login-logo" />
            <h2>Welcome</h2>
            
            <div className="login-actions">
                <button className="btn-primary" onClick={handleGoogleLogin}>
                    Sign in with Google
                </button>

                <button className="btn-secondary" onClick={() => onLogin(null)}>
                    Play as Guest
                </button>
            </div>
        </div>
    );
};

export default Login;
