import prisma from "./prisma";

const generateNumericOTP = (length: number): string => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 9 + 1).toString();
  }
  return otp;
};

function capitalizeFirstLetter(name: string): string {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getFirstName(fullName: string): string {
  const firstName = fullName.split(" ")[0];
  return capitalizeFirstLetter(firstName);
}

/**
 * Generate a referral code based on the user's email
 * @param {string} email - User's email address
 * @returns {string} - Generated referral code
 */
const generateReferralCode = (email: string): string => {
  return Buffer.from(email).toString("base64").slice(0, 8);
};

export {
  generateReferralCode,
  generateNumericOTP,
  capitalizeFirstLetter,
  getFirstName,
};
