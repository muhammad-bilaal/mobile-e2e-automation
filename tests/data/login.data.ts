export const LoginData = {
  formHeading: "Login / Sign up Form",
  email: "qa.automation@example.com",
  password: "Passw0rd!123",
  successAlertTitle: "Success",
  successAlertMessage: "You are logged in!",
};

export const loginValidationData = {
  invalidEmailError: "Please enter a valid email address",
  shortPasswordError: "Please enter at least 8 characters",
  minPasswordLength: 8,
  invalidEmails: [
    { name: "missing @", email: "userexample.com" },
    { name: "missing domain", email: "user@" },
    { name: "missing username", email: "@example.com" },
    { name: "missing TLD", email: "user@example" },
  ],
};
