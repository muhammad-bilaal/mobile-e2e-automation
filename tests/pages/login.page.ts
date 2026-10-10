import BasePage from "./base.page";
import { selector, textSelector } from "../factories/page.factory";
import { LoginData } from "../data/login.data";

export class LoginPage extends BasePage {
  public loginTab = selector("~Login", "~Login", "Login tab");
  public loginScreen = selector("~Login-screen", "~Login-screen", "Login screen");
  public formHeading = textSelector(LoginData.formHeading, "Login form heading");

  public loginFormTab = selector(
    "~button-login-container",
    "~button-login-container",
    "Login form tab",
  );
  public signUpFormTab = selector(
    "~button-sign-up-container",
    "~button-sign-up-container",
    "Sign up form tab",
  );

  public email = selector("~input-email", "~input-email", "Email input");
  public password = selector("~input-password", "~input-password", "Password input");
  public confirmPassword = selector(
    "~input-repeat-password",
    "~input-repeat-password",
    "Confirm password input",
  );

  public loginButton = selector("~button-LOGIN", "~button-LOGIN", "LOGIN button");

  async openLoginTab() {
    await this.click(this.loginTab);
    await this.waitUntilVisibleWithRetry(this.loginScreen);
    await this.click(this.loginFormTab);
  }

  async validateLoginFormIsVisible() {
    await this.assertElementDisplayed(this.loginScreen);
    await this.assertElementDisplayed(this.formHeading);
    await this.assertElementDisplayed(this.loginFormTab);
    await this.assertElementDisplayed(this.signUpFormTab);
    await this.assertElementDisplayed(this.email);
    await this.assertElementDisplayed(this.password);
    await this.assertElementDisplayed(this.loginButton);
    await this.assertElementNotDisplayed(this.confirmPassword);
    await this.assertElementEnabled(this.loginButton);
  }

  async addEmail(value: string) {
    await this.type(this.email, value);
  }

  async addPassword(value: string) {
    await this.type(this.password, value);
  }

  async login(email: string, password: string) {
    await this.addEmail(email);
    await this.addPassword(password);
    await this.hideKeyboard();
    await this.click(this.loginButton);
  }
}
