export const AUTH_ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
} as const;

export const PASSWORD_MIN_LENGTH = 8;

export const SIGN_UP_HEADING = "Yay, New Friend!";
export const SIGN_UP_LOGIN_LINK_LABEL = "We're already friends!";
export const SIGN_UP_BUTTON_LABEL = "Sign Up";
export const SIGN_UP_BUTTON_SUBMITTING_LABEL = "Signing up...";
export const SIGN_UP_GENERIC_ERROR =
  "Something went wrong. Please try again.";
export const EMAIL_INVALID_ERROR = "Enter a valid email address.";
export const PASSWORD_TOO_SHORT_ERROR =
  "Password must be at least 8 characters.";

export const LOGIN_HEADING = "Welcome Back!";
export const LOGIN_REGISTER_LINK_LABEL = "New here? Sign up";
export const LOGIN_BUTTON_LABEL = "Log In";
export const LOGIN_BUTTON_SUBMITTING_LABEL = "Logging in...";
export const LOGIN_GENERIC_ERROR = "Something went wrong. Please try again.";
export const LOGIN_INVALID_CREDENTIALS_ERROR = "Invalid email or password.";
export const PASSWORD_REQUIRED_ERROR = "Password is required.";
