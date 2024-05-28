interface User {
  id: number;
  fullName: string;
  email: string;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
  referralCode: string;
  referredById?: number;
  referredBy?: User;
  referrals: User[];
  referralsMade: Referral[];
  phoneNumber: string;
}

interface Referral {
  id: number;
  code: string;
  userId: number;
  user: User;
}

export { Referral, User };
