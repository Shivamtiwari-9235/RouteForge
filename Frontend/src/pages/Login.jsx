import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

const formStyles = 'w-full rounded-input border border-border bg-bg px-4 py-3 text-white outline-none focus:border-primary';

export default function Login() {
  const { login, register: registerUser } = useAuth();
  const { config, translate } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = isRegister ? await registerUser(data) : await login(data);
      if (response.success) {
        toast.success(response.message);
        navigate('/');
      } else {
        toast.error(response.error?.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Network error, please try again');
    }
  };

  // Demo login function for easy testing
  const demoLogin = async () => {
    try {
      const response = await login({ email: 'test@example.com', password: 'password123' });
      if (response.success) {
        toast.success('Demo login successful!');
        navigate('/');
      } else {
        toast.error('Demo login failed, please register first');
      }
    } catch (error) {
      toast.error('Demo login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg via-bg to-surface2 px-4 py-6">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-primary to-indigo-500 mb-6 shadow-2xl">
            <img src={config?.auth?.ui?.logo || '/logo.svg'} alt="Logo" className="w-10 h-10 rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted text-lg">
            {config?.auth?.ui?.primaryColor ? 'Access your dynamic app builder' : 'Secure access to your portal'}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-3xl border border-border shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  Full Name
                </label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-white placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required' })} 
                />
                {errors.name && <span className="text-sm text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name.message}
                </span>}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Email Address
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-white placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                type="email" 
                placeholder="Enter your email"
                {...register('email', { required: 'Email is required' })} 
              />
              {errors.email && <span className="text-sm text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </span>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Password
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-white placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                type="password" 
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} 
              />
              {errors.password && <span className="text-sm text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password.message}
              </span>}
            </div>
            
            <button 
              className="w-full py-4 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-xl font-semibold text-lg hover:from-primary/80 hover:to-indigo-500/80 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl" 
              type="submit"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button" 
              onClick={() => setIsRegister((value) => !value)} 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : 'New user? Create account'}
            </button>
          </div>

          {/* Demo Login Button */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-muted">Demo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={demoLogin}
              className="mt-4 w-full py-3 px-4 border border-primary/50 text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors"
            >
              🚀 Try Demo (test@example.com)
            </button>
            <p className="text-xs text-muted mt-2">Quick access for testing the system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
