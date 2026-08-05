import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, User, Phone, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { authService } from '../../services/authService';

// 1. Zod Validation Schema with unified Contact Information field (10-digit mobile or valid email)
const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .trim(),
  contact: z
    .string()
    .min(1, 'Contact Information is required.')
    .superRefine((val, ctx) => {
      const cleanVal = val.trim();
      if (!cleanVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Contact Information is required.',
        });
        return;
      }
      // If user enters only numeric digits
      if (/^\d+$/.test(cleanVal)) {
        if (!/^\d{10}$/.test(cleanVal)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid 10-digit mobile number.',
          });
        }
      } else {
        // If user enters alphabetic characters or '@', validate as email address
        const isEmail = z.string().email().safeParse(cleanVal).success;
        if (!isEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid email address.',
          });
        }
      }
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must contain at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
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
      contact: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Call mock authService register and navigate to /login
      await authService.register(data);
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error('Registration error:', err);
      setIsSubmitting(false);
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
              {/* Full Name */}
              <Input
                label="Full Name"
                placeholder="John Doe"
                required={true}
                icon={<User className="w-4 h-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              {/* Contact Information */}
              <Input
                label="Contact Information"
                type="text"
                placeholder="Enter your mobile number or email address"
                required={true}
                icon={<Phone className="w-4 h-4" />}
                error={errors.contact?.message}
                {...register('contact')}
              />

              {/* Password */}
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

              {/* Confirm Password */}
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
