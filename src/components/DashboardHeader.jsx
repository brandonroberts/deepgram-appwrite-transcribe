
import { useNavigate } from 'react-router-dom';
import './DashboardHeader.css';

export default function DashboardHeader({ user, setUser }) {
  const navigate = useNavigate();

  async function logout() {
    setUser(null);
    navigate('/');
  }

  return (
    <div className="dashboard-header">
      <div className="title">{user ? user.name : ''}</div>
      <div className="leave" onClick={logout}>
        Logout
      </div>
    </div>
  );
}
