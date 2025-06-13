
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; 

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <span>Agri-Diagnosis System</span>
      <div>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/diagnoses">Diagnoses</Link>
            {user.role === 'farmer' && <Link to="/submit-diagnosis">Submit New</Link>}
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <span>Hello, {user.username} ({user.role})</span>
            <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;