import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';

// 1. Zod Validation Schema matching backend contract (fullName, mobile, email, password)
// confirmPassword is used solely for frontend validation refinement.
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .trim(),
    mobile: z
      .string()
      .min(1, 'Mobile number is required')
      .transform((val) => val.trim())
      .refine((val) => /^\d{10}$/.test(val), {
        message: 'Mobile number must be exactly 10 digits',
      }),
    email: z
      .string()
      .transform((val) => val.trim())
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Please enter a valid email address',
      })
      .optional(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    // Backend Request Model (confirmPassword excluded)
    const payload = {
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email ? formData.email.trim() : '',
      password: formData.password,
    };

    // Print backend payload object to console locally
    console.log('Registration Payload:', payload);

    // Temporary frontend-only mock flow
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    }, 800);
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
            Create your AquaTrack Account
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">
            Start managing your prawn farm efficiently.
          </p>
        </div>

        {/* Registration Card Form */}
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface">
          {submitSuccess ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-success-light text-success flex items-center justify-center animate-bounce-slow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Account Created Successfully!</h2>
              <p className="text-xs text-text-secondary max-w-xs">
                Redirecting you to the login page...
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/login')}
              >
                Go to Login Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {/* Full Name (Required) */}
              <Input
                label="Full Name"
                placeholder="John Doe"
                required={true}
                icon={<User className="w-4 h-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              {/* Mobile Number (Required - Exactly 10 digits) */}
              <Input
                label="Mobile Number"
                type="text"
                placeholder="9876543210"
                required={true}
                icon={<Phone className="w-4 h-4" />}
                error={errors.mobile?.message}
                {...register('mobile')}
              />

              {/* Email Address (Optional) */}
              <Input
                label="Email Address"
                type="email"
                placeholder="farmer@aquatrack.io (optional)"
                required={false}
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password (Required - Min 8 characters) */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-text-secondary pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
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

              {/* Confirm Password (Required - Frontend validation only) */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-text-secondary pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className={`
                      w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
                      pl-10 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
                      ${errors.confirmPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'}
                    `}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded-md"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-danger font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                className="mt-2 shadow-sm font-semibold"
              >
                Create Account
              </Button>
            </form>
          )}
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-secondary mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
