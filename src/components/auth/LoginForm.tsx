
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Navigation will be handled by the auth state change in Login.tsx
      } else {
        setError(result.error || 'Login failed');
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
          Production Login: rohith@springreen.in / admin123
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
            <p>Password: "password" for demo accounts</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
