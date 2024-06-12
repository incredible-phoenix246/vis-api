import jwt from "jsonwebtoken";

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

/**
 * Extracts the user ID from the provided JWT token.
 * @param {string} token - The JWT token containing the user ID
 * @returns {string | null} - The user ID if found, otherwise null
 */
const getUserIdFromToken = (token: string): string | null => {
  if (!token || !token.startsWith("Bearer ")) {
    console.error("Invalid token format");
    return null;
  }

  const jwtToken = token.split(" ")[1];
  try {
    const decoded: any = jwt.verify(jwtToken, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export {
  generateReferralCode,
  generateNumericOTP,
  capitalizeFirstLetter,
  getFirstName,
  getUserIdFromToken,
};
