export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phonenumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UserClaims {
  userId: number;
  email: string;
  name: string;
  role: string | number;
}
