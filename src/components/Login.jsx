import React from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from '../firebase';

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
        <div className="menu">
            <h2>Welcome to Guitar Tab Hero</h2>
            <p>Sign in to save your progress and compete!</p>

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
