import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

export default function LoginForm({ setUser }) {
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    try {
      } catch(e) {
        
      } finally {

        navigate('/dashboard');
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={login}>
        <p className="login-name">
          <label htmlFor="name">Name</label>

          <input type="text" id="name" name="name" placeholder="Enter Name" required/>
        </p>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
