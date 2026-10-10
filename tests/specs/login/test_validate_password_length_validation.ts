import allureReporter from "@wdio/allure-reporter";
import { generatePasswordByLength, step } from "../../utils/helpers";
import { LoginData, loginValidationData } from "../../data/login.data";
import { LoginPage } from "../../pages/login.page";

describe("Authentication - Password length validation", () => {
  it("should require a password of at least 8 characters", async () => {
    const loginPage = new LoginPage();
    const minLength = loginValidationData.minPasswordLength;

    allureReporter.addFeature("Authentication");
    allureReporter.addStory("Login Validation");
    allureReporter.addSeverity("normal");

    await step("Navigate to login screen", async () => {
      await loginPage.openLoginTab();
      await loginPage.validateLoginFormIsVisible();
    });

    await step("Submit an empty form and verify both errors", async () => {
      await loginPage.click(loginPage.loginButton);
      await loginPage.assertTextVisible(loginValidationData.invalidEmailError);
      await loginPage.assertTextVisible(loginValidationData.shortPasswordError);
    });

    await step(`Validate error for a ${minLength - 1} character password`, async () => {
      const password = generatePasswordByLength(minLength - 1);
      expect(password).toHaveLength(minLength - 1);

      await loginPage.login(LoginData.email, password);
      await loginPage.assertTextVisible(loginValidationData.shortPasswordError);
      await loginPage.assertTextNotVisible(loginValidationData.invalidEmailError);
      await loginPage.assertElementNotDisplayed(loginPage.alertTitle);
    });

    await step(`Validate a ${minLength} character password is accepted`, async () => {
      const password = generatePasswordByLength(minLength);
      expect(password).toHaveLength(minLength);

      await loginPage.login(LoginData.email, password);
      await loginPage.assertAlert(
        LoginData.successAlertTitle,
        LoginData.successAlertMessage,
      );
      await loginPage.acceptAlert();
      await loginPage.assertTextNotVisible(loginValidationData.shortPasswordError);
    });
  });
});
