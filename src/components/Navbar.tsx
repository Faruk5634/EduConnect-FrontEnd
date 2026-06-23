import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    // Çıkış yapma fonksiyonu
    const handleLogout = () => {
        // 1. Kasadaki (localStorage) asıl bileti yırtıp atıyoruz (jwtToken yerine token yapıyoruz)
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); // Hazır çıkmışken rütbeyi de temizleyelim tam olsun!

        // 2. Kullanıcıyı anında Login (Giriş) ekranına fırlatıyoruz
        navigate('/');
    };

    return (
        <nav style={{
            backgroundColor: '#2c3e50',
            padding: '15px 30px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ margin: 0 }}>⚓ EduConnect</h2>

            <button
                onClick={handleLogout}
                style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Güverteyi Terk Et (Çıkış)
            </button>
        </nav>
    );
}