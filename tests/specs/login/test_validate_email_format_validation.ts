import allureReporter from "@wdio/allure-reporter";
import { step } from "../../utils/helpers";
import { LoginData, loginValidationData } from "../../data/login.data";
import { LoginPage } from "../../pages/login.page";

describe("Authentication - Email format validation", () => {
  it("should reject every malformed email and accept a valid one", async () => {
    const loginPage = new LoginPage();

    allureReporter.addFeature("Authentication");
    allureReporter.addStory("Login Validation");
    allureReporter.addSeverity("critical");

    await step("Navigate to login screen", async () => {
      await loginPage.openLoginTab();
      await loginPage.validateLoginFormIsVisible();
    });

    await step("Verify no error is shown before submitting", async () => {
      await loginPage.assertTextNotVisible(loginValidationData.invalidEmailError);
    });

    for (const testCase of loginValidationData.invalidEmails) {
      await step(`Validate error for email with ${testCase.name}: "${testCase.email}"`, async () => {
        await loginPage.login(testCase.email, LoginData.password);

        await loginPage.assertTextVisible(loginValidationData.invalidEmailError);
        await loginPage.assertTextNotVisible(loginValidationData.shortPasswordError);
        await loginPage.assertElementNotDisplayed(loginPage.alertTitle);
      });
    }

    await step("Correct the email and verify the error clears", async () => {
      await loginPage.login(LoginData.email, LoginData.password);
      await loginPage.assertAlert(
        LoginData.successAlertTitle,
        LoginData.successAlertMessage,
      );
      await loginPage.acceptAlert();
      await loginPage.assertTextNotVisible(loginValidationData.invalidEmailError);
    });
  });
});
