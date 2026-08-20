import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Phone, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

// 1. Zod Login Schema supporting ONLY 10-digit Mobile Number and Password
const loginSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .transform((val) => val.trim())
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Mobile number must be exactly 10 digits',
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must contain at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError('');

    const payload = {
      mobile: data.mobile.trim(),
      password: data.password,
    };

    try {
      await authLogin(payload);
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setIsSubmitting(false);
      setApiError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Effect */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* AquaTrack Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Droplets className="w-7 h-7" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-2xl text-primary tracking-tight leading-tight">
              AquaTrack
            </span>
            <span className="text-[10px] text-text-secondary font-medium tracking-widest uppercase">
              Prawn Farm Platform
            </span>
          </div>
        </Link>

        {/* Heading & Subheading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">
            Login with your mobile number to continue managing your farm.
          </p>
        </div>

        {/* Login Card Form */}
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface">
          {submitSuccess ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-success-light text-success flex items-center justify-center animate-bounce-slow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Login Successful!</h2>
              <p className="text-xs text-text-secondary max-w-xs">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {apiError && (
                <div className="p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20">
                  {apiError}
                </div>
              )}

              {/* Mobile Number Only */}
              <Input
                label="Mobile Number"
                type="text"
                placeholder="9876543210"
                required={true}
                icon={<Phone className="w-4 h-4" />}
                error={errors.mobile?.message}
                {...register('mobile')}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-primary tracking-wide flex items-center justify-between select-none">
                  <span className="flex items-center gap-1">
                    Password <span className="text-danger">*</span>
                  </span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-text-secondary pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`
                      w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
                      pl-10 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
                      ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'}
                    `}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded-md"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                className="mt-2 shadow-sm font-semibold"
              >
                Login
              </Button>
            </form>
          )}
        </Card>

        {/* Register Footer Link */}
        <p className="text-center text-xs text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
