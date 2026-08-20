/**
 * OTP Service for sending and managing OTP notifications.
 * Connects to Twilio / SMS Gateways to deliver real SMS to user's mobile phone.
 * NO secret OTP codes are printed to the backend terminal.
 */

export const generateNumericOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const sendSMS = async (mobile, otp) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
  const fast2smsApiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;

  let smsSent = false;
  const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  // 1. Twilio Verify API (Sends real SMS directly to mobile phone)
  if (twilioSid && twilioAuthToken && twilioVerifyServiceSid && !smsSent) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedMobile);
      params.append('Channel', 'sms');

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );
      const data = await response.json();
      if (response.ok && (data.status === 'pending' || data.status === 'approved')) {
        console.log(`[AquaTrack OTP Service] Real SMS delivered to ${formattedMobile}`);
        smsSent = true;
      } else {
        console.error('[Twilio Verify Error]', data.message || data);
      }
    } catch (err) {
      console.error('[Twilio Verify Exception]', err.message);
    }
  }

  // 2. Standard Twilio Outbound SMS (Fallback)
  if (twilioSid && twilioAuthToken && twilioFromNumber && !smsSent) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedMobile);
      params.append('From', twilioFromNumber);
      params.append('Body', `Your AquaTrack verification code is: ${otp}. Valid for 10 minutes.`);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(`[AquaTrack OTP Service] Real SMS delivered to ${formattedMobile}`);
        smsSent = true;
      } else {
        console.error('[Twilio SMS Error]', data.message || data);
      }
    } catch (err) {
      console.error('[Twilio SMS Exception]', err.message);
    }
  }

  // 3. Fast2SMS Integration (Fallback)
  if (fast2smsApiKey && !smsSent) {
    try {
      const quickSmsMsg = encodeURIComponent(`Your AquaTrack verification code is ${otp}. Valid for 10 minutes.`);
      const response = await fetch(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
          fast2smsApiKey
        )}&route=q&message=${quickSmsMsg}&language=english&flash=0&numbers=${encodeURIComponent(
          mobile
        )}`
      );
      const data = await response.json();
      if (data.return) {
        console.log(`[AquaTrack OTP Service] Real SMS delivered to ${mobile}`);
        smsSent = true;
      }
    } catch (err) {
      console.error('[Fast2SMS Exception]', err.message);
    }
  }

  // Clean status log ONLY - NO OTP code exposed in backend terminal console
  if (!smsSent) {
    console.warn(`[AquaTrack OTP Service] Could not send SMS to ${formattedMobile}. Check SMS provider credentials.`);
  }

  return { success: true, smsSent };
};

/**
 * Verify OTP code against Twilio Verify API (or DB fallback).
 */
export const verifyTwilioCode = async (mobile, code) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (twilioSid && twilioAuthToken && twilioVerifyServiceSid) {
    try {
      const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedMobile);
      params.append('Code', code);

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );
      const data = await response.json();
      if (response.ok && data.status === 'approved') {
        console.log(`[AquaTrack OTP Service] Code approved for ${formattedMobile}`);
        return { verified: true, approvedBy: 'twilio' };
      }
    } catch (err) {
      console.error('[Twilio VerifyCheck Exception]', err.message);
    }
  }

  return { verified: false };
};

export default {
  generateNumericOTP,
  sendSMS,
  verifyTwilioCode,
};
