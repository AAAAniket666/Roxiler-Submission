import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePassword, getPasswordStrength } from '../utils/helpers';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  React.useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(data);
      if (response.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Error is handled by the auth service and api interceptor
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-yellow-500';
    if (strength < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 20,
                    message: 'Name must be at least 20 characters',
                  },
                  maxLength: {
                    value: 60,
                    message: 'Name cannot exceed 60 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Name can only contain letters and spaces',
                  },
                })}
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) =>
                    isValidEmail(value) || 'Please enter a valid email address',
                })}
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  maxLength: {
                    value: 16,
                    message: 'Password cannot exceed 16 characters',
                  },
                })}
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
              
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <textarea
                {...register('address', {
                  maxLength: {
                    value: 400,
                    message: 'Address cannot exceed 400 characters',
                  },
                })}
                rows={3}
                className="input-field"
                placeholder="Enter your address"
              />
              {errors.address && (
                <p className="form-error">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role')}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;