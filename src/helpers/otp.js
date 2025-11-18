import otp from 'otp-generator';
export const generateOtp = () => {
  const result = otp.generate(6, { number: true });
  return result;
};
