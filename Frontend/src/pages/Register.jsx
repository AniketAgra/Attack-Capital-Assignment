import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
    const [ form, setForm ] = useState({ email: '', firstname: '', lastname: '', password: '' });
    const [ showPassword, setShowPassword ] = useState(false);
    const [ submitting, setSubmitting ] = useState(false);
    const navigate = useNavigate();


    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [ name ]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        console.log(form);

        axios.post("https://attack-capital-assignment.onrender.com/api/auth/register", {
            email: form.email,
            fullName: {
                firstName: form.firstname,
                lastName: form.lastname
            },
            password: form.password
        }, {
            withCredentials: true
        }).then((res) => {
            console.log(res);
            toast.success('Account created');
            navigate("/");
        }).catch((err) => {
            console.error(err);
            const msg = err?.response?.data?.message || 'Registration failed';
            toast.error(msg);
        }).finally(() => {
            setSubmitting(false);
        });
    }

    const strength = useMemo(() => {
        const p = form.password || '';
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 10) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return Math.min(score, 5);
    }, [form.password]);

    const strengthLabel = ['Too short','Weak','Okay','Good','Strong','Very strong'][strength] || 'Too short';
    const strengthColors = ['#dc2626', '#f97316', '#f59e0b', '#a3e635', '#22c55e'];
    const currentColor = strength > 0 ? strengthColors[Math.min(strength, 5) - 1] : '#9a9a9a';

    return (
        <div className="center-min-h-screen">
            <div className="auth-card auth-card--wide" role="main" aria-labelledby="register-heading">
                <header className="auth-header">
                    <h1 id="register-heading">Create account</h1>
                    <p className="auth-sub">Join us and start exploring.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoFocus />
                    </div>
                    <div className="grid-2">
                        <div className="field-group">
                            <label htmlFor="firstname">First name</label>
                            <input id="firstname" name="firstname" placeholder="Jane" value={form.firstname} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="lastname">Last name</label>
                            <input id="lastname" name="lastname" placeholder="Doe" value={form.lastname} onChange={handleChange} required />
                        </div>
                    </div>
                                        <div className="field-group">
                                                <label htmlFor="password">Password</label>
                                                <div style={{ position:'relative' }}>
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        autoComplete="new-password"
                                                        placeholder="Create a password"
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
                                                                        <div aria-live="polite" style={{ marginTop: 8 }}>
                                                                                                        <div style={{ display:'flex', gap:6 }}>
                                                                                                            {Array.from({ length: 5 }).map((_, i) => {
                                                                                                                const filled = i < strength;
                                                                                                                const barColor = filled ? currentColor : '#151515';
                                                                                                                const borderColor = filled ? currentColor : '#262626';
                                                                                                                return (
                                                                                                                    <span
                                                                                                                        key={i}
                                                                                                                        style={{ flex:1, height:6, borderRadius:4, background: barColor, border: `1px solid ${borderColor}` }}
                                                                                                                    />
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                        <small style={{ display:'block', marginTop:6, color:'#cfcfcf' }}>
                                                                                                            Strength: <span style={{ color: currentColor }}>{strengthLabel}</span>
                                                                                                        </small>
                                                    <small style={{ display:'block', marginTop:2, color:'#7a7a7a' }}>Use 10+ chars with numbers, symbols and uppercase for a stronger password.</small>
                                                </div>
                                        </div>
                    <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <p className="auth-alt">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;

