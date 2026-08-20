import api from './api';

/**
 * Service to handle Forgot Password API calls.
 */
export const sendOtp = async (mobile) => {
  try {
    const response = await api.post('/forgot-password/send-otp', { mobile });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to send OTP');
  }
};

export const verifyOtp = async (mobile, otp) => {
  try {
    const response = await api.post('/forgot-password/verify-otp', { mobile, otp });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'OTP verification failed');
  }
};

export const resetPassword = async (mobile, otp, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/forgot-password/reset-password', {
      mobile,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Password reset failed');
  }
};

export const forgotPasswordService = {
  sendOtp,
  verifyOtp,
  resetPassword,
};

export default forgotPasswordService;
