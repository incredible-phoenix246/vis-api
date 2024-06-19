export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  otp?: string;
  otpExpires?: Date;
  createdAt?: Date;
  updatedAt: Date;
  cacNumber: string;
  ninNumber: string;
  password?: string;
  referralCode?: string;
  referredById?: string;
  mobilityType: string;
  driversLicense: string;
  vechLicense: string;
  referredBy?: User;
  referrals: User[];
  referralsMade: Referral[];
  verified: boolean;
  accountType: string;
  sentMessages: Message[];
  receivedMessages: Message[];
  conversationsAsSender: Conversation[];
  conversationsAsReceiver: Conversation[];
  orders: Order[];
  bids: Bid[];
  deliveries: Order[];
}

export interface Referral {
  id: number;
  code: string;
  userId: string;
  user: User;
}

export interface Conversation {
  id: string;
  senderId: string;
  receiverId: string;
  messages: Message[];
  sender: User;
  receiver: User;
}

export interface Message {
  id: number;
  content: string;
  createdAt: Date;
  senderId: string;
  receiverId: string;
  conversationId: string;
  conversation: Conversation;
  sender: User;
  receiver: User;
}

export interface Order {
  id: string;
  pickupname: string;
  pickupaddress: string;
  pickupphone: string;
  pickupitem: string[] | string;
  weight?: string;
  deliverymode: string;
  note?: string;
  dropoffname: string;
  dropoffaddress: string;
  dropoffphone: string;
  deliverytype: string;
  insurance: boolean;
  owner: User;
  userId: string;
  deliveryAgent?: User;
  deliveryAgentId?: string;
  bids: Bid[];
  itemvalue?: string;
}

export interface Bid {
  id: number;
  bidder: User;
  userId: string;
  order: Order;
  orderId: string;
  accepted?: boolean;
  price: string;
  deliveryhour: string;
}

export interface Notification {
  from: string;
  avatar: string;
  type: string;
  item: {
    type: string;
    body: string;
  };
  read?: boolean;
  userId: string;
}
