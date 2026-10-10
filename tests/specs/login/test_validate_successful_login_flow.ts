import allureReporter from "@wdio/allure-reporter";
import { step } from "../../utils/helpers";
import { LoginData, loginValidationData } from "../../data/login.data";
import { LoginPage } from "../../pages/login.page";

describe("Authentication - Successful Login Flow", () => {
  it("should log in with valid credentials and show the success alert", async () => {
    const loginPage = new LoginPage();

    allureReporter.addFeature("Authentication");
    allureReporter.addStory("Successful Login");
    allureReporter.addSeverity("critical");

    await step("Navigate to login screen", async () => {
      await loginPage.openLoginTab();
    });

    await step("Verify login screen elements", async () => {
      await loginPage.validateLoginFormIsVisible();
      await loginPage.assertTextEquals(loginPage.formHeading, LoginData.formHeading);
    });

    await step("Enter valid email and password", async () => {
      await loginPage.addEmail(LoginData.email);
      await loginPage.addPassword(LoginData.password);
      await loginPage.assertTextEquals(loginPage.email, LoginData.email);
    });

    await step("Submit the login form", async () => {
      await loginPage.hideKeyboard();
      await loginPage.click(loginPage.loginButton);
    });

    await step("Verify no validation errors are shown", async () => {
      await loginPage.assertTextNotVisible(loginValidationData.invalidEmailError);
      await loginPage.assertTextNotVisible(loginValidationData.shortPasswordError);
    });

    await step("Verify success alert title and message", async () => {
      await loginPage.assertAlert(
        LoginData.successAlertTitle,
        LoginData.successAlertMessage,
      );
    });

    await step("Dismiss the alert and verify user stays on login screen", async () => {
      await loginPage.acceptAlert();
      await loginPage.assertElementDisplayed(loginPage.loginScreen);
      await loginPage.assertElementDisplayed(loginPage.loginButton);
    });
  });
});
