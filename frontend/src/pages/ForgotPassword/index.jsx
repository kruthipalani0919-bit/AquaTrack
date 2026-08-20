import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Droplets,
  Phone,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import forgotPasswordService from '../../services/forgotPasswordService';

// Step 1: Mobile Schema
const mobileSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .transform((val) => val.trim())
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Mobile number must be exactly 10 digits',
    }),
});

// Step 2: OTP Schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .transform((val) => val.trim())
    .refine((val) => /^\d{6}$/.test(val), {
      message: 'OTP must be a 6-digit number',
    }),
});

// Step 3: Password Schema
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'New password must contain at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Multi-step state: 1 = Mobile, 2 = OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccessMsg, setApiSuccessMsg] = useState('');

  // Resend OTP Countdown Timer (30s)
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Form Hooks for each step
  const mobileForm = useForm({
    resolver: zodResolver(mobileSchema),
    defaultValues: { mobile: '' },
    mode: 'onTouched',
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
    mode: 'onTouched',
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  // Step 1 Submission: Send OTP
  const onSendOtp = async (data) => {
    setIsSubmitting(true);
    setApiError('');
    setApiSuccessMsg('');

    try {
      const res = await forgotPasswordService.sendOtp(data.mobile);
      setMobileNumber(data.mobile);
      setApiSuccessMsg(res.message || 'OTP sent successfully to your mobile number.');
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setApiError(err.message || 'Failed to send OTP. Please check the mobile number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');
    setApiSuccessMsg('');

    try {
      const res = await forgotPasswordService.sendOtp(mobileNumber);
      setApiSuccessMsg(res.message || 'A new OTP has been sent to your mobile number.');
      setResendTimer(30);
    } catch (err) {
      setApiError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Submission: Verify OTP
  const onVerifyOtp = async (data) => {
    setIsSubmitting(true);
    setApiError('');
    setApiSuccessMsg('');

    try {
      const res = await forgotPasswordService.verifyOtp(mobileNumber, data.otp);
      setVerifiedOtp(data.otp);
      setApiSuccessMsg(res.message || 'OTP verified successfully.');
      setStep(3);
    } catch (err) {
      setApiError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 Submission: Reset Password
  const onResetPassword = async (data) => {
    setIsSubmitting(true);
    setApiError('');
    setApiSuccessMsg('');

    try {
      const res = await forgotPasswordService.resetPassword(
        mobileNumber,
        verifiedOtp,
        data.newPassword,
        data.confirmPassword
      );
      setApiSuccessMsg(res.message || 'Password reset successfully!');
      setStep(4);
    } catch (err) {
      setApiError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
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

        {/* Step Headings */}
        <div className="text-center mb-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Enter your registered mobile number to receive a verification OTP.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Verify OTP
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Enter the 6-digit OTP sent to <span className="font-semibold text-primary">{mobileNumber}</span>.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Create a strong new password for your account.
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Password Reset Complete
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Your password has been updated successfully.
              </p>
            </>
          )}
        </div>

        {/* Main Card Form */}
        <Card padding="relaxed" className="shadow-lg border-border/80 bg-surface">
          {/* Notification Banners */}
          {apiError && (
            <div className="mb-4 p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20">
              {apiError}
            </div>
          )}

          {apiSuccessMsg && step !== 4 && (
            <div className="mb-4 p-3 bg-success-light text-success rounded-lg text-xs font-medium border border-success/20">
              {apiSuccessMsg}
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER INPUT */}
          {step === 1 && (
            <form onSubmit={mobileForm.handleSubmit(onSendOtp)} className="flex flex-col gap-4" noValidate>
              <Input
                label="Registered Mobile Number"
                type="text"
                placeholder="Enter 10-digit mobile number"
                required={true}
                icon={<Phone className="w-4 h-4" />}
                error={mobileForm.formState.errors.mobile?.message}
                {...mobileForm.register('mobile')}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                className="mt-2 shadow-sm font-semibold"
              >
                Send OTP
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="flex flex-col gap-4" noValidate>
              <Input
                label="6-Digit OTP"
                type="text"
                placeholder="123456"
                required={true}
                icon={<KeyRound className="w-4 h-4" />}
                error={otpForm.formState.errors.otp?.message}
                {...otpForm.register('otp')}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                className="mt-2 shadow-sm font-semibold"
              >
                Verify OTP
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isSubmitting}
                  className={`flex items-center gap-1 font-semibold ${
                    resendTimer > 0 || isSubmitting
                      ? 'text-text-secondary/50 cursor-not-allowed'
                      : 'text-primary hover:text-primary-hover hover:underline'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="flex flex-col gap-4" noValidate>
              {/* New Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-text-secondary pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className={`
                      w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
                      pl-10 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
                      ${passwordForm.formState.errors.newPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'}
                    `}
                    {...passwordForm.register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded-md"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-danger font-medium">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-text-secondary pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    className={`
                      w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
                      pl-10 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
                      ${passwordForm.formState.errors.confirmPassword ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'}
                    `}
                    {...passwordForm.register('confirmPassword')}
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
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-danger font-medium">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={isSubmitting}
                className="mt-2 shadow-sm font-semibold"
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="py-6 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-success-light text-success flex items-center justify-center animate-bounce-slow">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-text-primary">Password Reset Successful!</h2>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  Your password has been changed successfully. You can now login with your new credentials.
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => navigate('/login', { replace: true })}
                className="mt-2 font-semibold shadow-sm"
              >
                Proceed to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
