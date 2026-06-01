import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username: username.trim(),
                password
            });

            const { token, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            if (role === 'ROLE_ADMIN') {
                navigate('/admin');
                return;
            }
            if (role === 'ROLE_TEACHER') {
                navigate('/teacher');
                return;
            }
            if (role === 'ROLE_PARENT') {
                navigate('/parent');
                return;
            }
            if (role === 'ROLE_STUDENT') {
                navigate('/student');
                return;
            }

            setError('Kullanıcı rolü bulunamadı.');
        } catch (err) {
            setError('Kullanıcı adı veya şifre hatalı');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>EduConnect</h1>
                    <p style={styles.subtitle}>Hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>
                        Kullanıcı Adı
                        <input
                            type="text"
                            placeholder="örn. teacher"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </label>

                    <label style={styles.label}>
                        Şifre
                        <input
                            type="password"
                            placeholder="Şifrenizi girin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </label>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" style={styles.button}>
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e8f0ff 0%, #f7f9ff 50%, #ffffff 100%)',
        padding: '24px'
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
        padding: '36px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    title: {
        margin: 0,
        fontSize: '28px',
        fontWeight: 700,
        color: '#0f172a'
    },
    subtitle: {
        marginTop: '8px',
        marginBottom: 0,
        color: '#64748b'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '14px',
        color: '#334155',
        fontWeight: 600
    },
    input: {
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '15px',
        outline: 'none'
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '13px'
    },
    button: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)'
    }
};
