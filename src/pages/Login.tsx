
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      redirectBasedOnRole(role);
    }
  }, [isAuthenticated, role, navigate]);

  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case 'owner':
        navigate('/owner/dashboard');
        break;
      case 'superadmin':
        navigate('/admin/dashboard');
        break;
      case 'employee':
        navigate('/employee/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 shadow-xl bg-white rounded-lg overflow-hidden">
        <div className="hidden md:block bg-ca-blue p-8 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">CA Flow</h1>
            <p className="text-lg mb-6">Task management platform for Chartered Accountancy firms</p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Role-based secure access</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Task management & templates</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Invoicing & payment tracking</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Client communication</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Performance analytics</span>
              </li>
            </ul>
          </div>
          <div className="text-sm text-white/80 mt-16">
            <p>© 2024 CA Flow. All rights reserved.</p>
            <p>Streamlining CA workflows for optimal efficiency</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
