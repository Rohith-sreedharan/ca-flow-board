
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@/store/slices/authSlice';

type LoginFormData = {
  email: string;
  password: string;
};

const mockUsers = [
  { id: '101', email: 'owner@caflow.com', password: 'password', name: 'John Owner', role: 'owner' },
  { id: '102', email: 'admin@caflow.com', password: 'password', name: 'Sarah Admin', role: 'superadmin' },
  { id: '103', email: 'employee@caflow.com', password: 'password', name: 'Mike Employee', role: 'employee' },
  { id: '104', email: 'client@caflow.com', password: 'password', name: 'Acme Corporation', role: 'client' },
];

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const user = mockUsers.find(u => u.email === data.email);
      
      if (user && user.password === data.password) {
        // Mock successful login
        dispatch(setCredentials({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15),
        }));
        
        // Redirect based on role
        switch (user.role) {
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
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] shadow-lg">
      <CardHeader>
        <CardTitle className="text-ca-blue text-2xl font-bold">Login to CA Flow</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { 
                required: "Email is required", 
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address"
                } 
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-ca-blue hover:underline">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit" 
            className="w-full bg-ca-blue hover:bg-ca-blue-dark"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Demo Credentials - Check out these roles:
        </p>
      </CardFooter>
      <CardFooter className="p-0">
        <div className="grid grid-cols-2 gap-2 w-full px-6 pb-6 text-xs">
          <div>
            <p className="font-medium">Owner:</p>
            <p>owner@caflow.com</p>
          </div>
          <div>
            <p className="font-medium">Super Admin:</p>
            <p>admin@caflow.com</p>
          </div>
          <div>
            <p className="font-medium">Employee:</p>
            <p>employee@caflow.com</p>
          </div>
          <div>
            <p className="font-medium">Client:</p>
            <p>client@caflow.com</p>
          </div>
          <div className="col-span-2 text-center mt-1 text-gray-500">
            <p>Password: "password" for all accounts</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
