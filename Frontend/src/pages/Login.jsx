import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


const Login = () => {
    const [ form, setForm ] = useState({ email: '', password: '', rememberMe: false });
    const [ showPassword, setShowPassword ] = useState(false);
    const [ submitting, setSubmitting ] = useState(false);
    const navigate = useNavigate();
    

    function handleChange(e) {
        const { name, value } = e.target;
    const newValue = e.target.type === 'checkbox' ? e.target.checked : value;
    setForm({ ...form, [name]: newValue });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);


        console.log(form);

    axios.post("http://localhost:3000/api/auth/login", {
            email: form.email,
            password: form.password,
            rememberMe: form.rememberMe
        },
            {
                withCredentials: true
            }
        ).then((res) => {
            console.log(res);
            toast.success('Logged in');
            navigate("/");
        }).catch((err) => {
            console.error(err);
            toast.error('Login failed');
        }).finally(() => {
            setSubmitting(false);
        });

    }

    return (
        <div className="center-min-h-screen">
            <div className="auth-card" role="main" aria-labelledby="login-heading">
                <header className="auth-header">
                    <h1 id="login-heading">Sign in</h1>
                    <p className="auth-sub">Welcome back. We've missed you.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoFocus />
                    </div>
                                        <div className="field-group">
                                                <label htmlFor="login-password">Password</label>
                                                <div style={{ position:'relative' }}>
                                                    <input
                                                        id="login-password"
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        autoComplete="current-password"
                                                        placeholder="Your password"
                                                        value={form.password}
                                                        onChange={handleChange}
                                                        required
                                                        minLength={6}
                                                        style={{ paddingRight: '44px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        onClick={() => setShowPassword(s => !s)}
                                                        style={{ position:'absolute', right:8, top: '50%', transform:'translateY(-50%)', background:'transparent', color:'#bdbdbd', border:0, cursor:'pointer', padding:'6px', borderRadius:8 }}
                                                    >
                                                        {showPassword ? 'Hide' : 'Show'}
                                                    </button>
                                                </div>
                                        </div>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 2 }}>
                                                <label style={{ display:'inline-flex', gap:8, alignItems:'center', fontSize:'0.9rem', color:'#c7c7c7' }}>
                                                    <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
                                                    Remember me
                                                </label>
                                                <Link to="#" style={{ color:'#bdbdbd', textDecoration:'none' }}>Forgot password?</Link>
                                        </div>
                                        <button type="submit" className="primary-btn" disabled={submitting} style={{ marginTop: 8 }}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className="auth-alt">Need an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
};

export default Login;

