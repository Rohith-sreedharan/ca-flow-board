
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// This is just a redirect page to the login page or appropriate dashboard
const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
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
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;
