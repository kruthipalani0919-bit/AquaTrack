/**
 * OTP Service using Twilio Verify API to deliver real SMS directly to mobile phones.
 * NO secret OTP codes are printed or logged in the backend terminal.
 */

export const sendSMS = async (mobile) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // Format mobile to E.164 (+91XXXXXXXXXX)
  const cleanDigits = (mobile || '').replace(/\D/g, '');
  const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
  const formattedMobile = `+91${tenDigits}`;

  if (!twilioSid || !twilioAuthToken || !twilioVerifyServiceSid) {
    console.error('[AquaTrack OTP Error] Missing Twilio Verify credentials in environment variables.');
    throw new Error('Twilio Verify service is not properly configured.');
  }

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

    if (!response.ok) {
      console.error('[Twilio Verify API Error]', data.message || data);
      throw new Error(data.message || 'Failed to dispatch verification SMS via Twilio.');
    }

    console.log(`[AquaTrack OTP Service] Real SMS verification code dispatched via Twilio to ${formattedMobile}`);
    return { success: true, smsSent: true, sid: data.sid };
  } catch (err) {
    console.error('[Twilio Verify Exception]', err.message);
    throw err;
  }
};

/**
 * Verify OTP code directly against Twilio Verify API.
 */
export const verifyTwilioCode = async (mobile, code) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (twilioSid && twilioAuthToken && twilioVerifyServiceSid) {
    try {
      const cleanDigits = (mobile || '').replace(/\D/g, '');
      const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
      const formattedMobile = `+91${tenDigits}`;

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
        console.log(`[AquaTrack OTP Service] Code approved by Twilio for ${formattedMobile}`);
        return { verified: true };
      } else {
        console.warn(`[Twilio VerifyCheck Status] ${data.status || 'not approved'} for ${formattedMobile}`);
      }
    } catch (err) {
      console.error('[Twilio VerifyCheck Exception]', err.message);
    }
  }

  return { verified: false };
};

export default {
  sendSMS,
  verifyTwilioCode,
};
