import { AssertionError } from "node:assert";
import { $, browser, expect } from "@wdio/globals";
import { getPlatform } from "../factories/selector.factory";
import {
  resolveLocator,
  selector,
  textSelector,
  type DualSelector,
} from "../factories/page.factory";
import Logger from "../utils/logger";
import { Timeout } from "../utils/timers";

type MobileElement = Awaited<ReturnType<typeof $>>;

export default class BasePage {
  public alertTitle = selector(
    'android=new UiSelector().resourceIdMatches(".*:id/alert_?[tT]itle")',
    "-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]",
    "Alert title",
  );
  public alertMessage = selector(
    'android=new UiSelector().resourceId("android:id/message")',
    "-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[2]",
    "Alert message",
  );
  public alertOkButton = selector(
    'android=new UiSelector().resourceId("android:id/button1")',
    "~OK",
    "Alert OK button",
  );

  // Cold emulators sometimes show an "<app> isn't responding" dialog.
  private readonly systemAnrWaitButton = selector(
    'android=new UiSelector().resourceId("android:id/aerr_wait")',
    "~Wait",
    "System ANR Wait button",
  );

  async resolve(selector: DualSelector) {
    const platform = await getPlatform();
    return $(resolveLocator(selector, platform));
  }

  async getElement(
    selector: DualSelector,
    options?: { wait?: boolean; timeout?: number },
  ) {
    const { wait = true, timeout = Timeout.FIVE_SECONDS } = options || {};

    Logger.info(`Getting element: ${selector.log}`);

    const element = await this.resolve(selector);

    if (wait) {
      await element.waitForExist({ timeout });
    }

    return element;
  }

  async handleSystemDialogs() {
    if (driver.isIOS) {
      return;
    }
    if (await this.isElementVisible(this.systemAnrWaitButton, Timeout.ONE_SECOND)) {
      Logger.info("System ANR dialog on screen - tapping Wait");
      await this.click(this.systemAnrWaitButton);
    }
  }

  async waitUntilVisibleWithRetry(
    selector: DualSelector,
    maxAttempts: number = 10,
    restTime: number = Timeout.THREE_SECONDS,
    maxTotalWait: number = Timeout.THIRTY_SECONDS,
  ) {
    let attempt = 1;
    const deadline = Date.now() + maxTotalWait;

    while (attempt <= maxAttempts) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        break;
      }

      try {
        Logger.info(
          `[Attempt ${attempt}] waiting for element ${selector.log} to be visible`,
        );

        const element = await this.resolve(selector);

        await element.waitForDisplayed({
          timeout: Math.min(restTime, remaining),
        });

        Logger.info("Element visible");
        return element;
      } catch {
        Logger.info(`Attempt ${attempt} failed. Element not visible yet`);
        attempt++;
      }
    }

    throw new AssertionError({
      message: `Expected element ${selector.log} to be visible, but it was not after ${attempt - 1} attempt(s) within ${maxTotalWait}ms`,
    });
  }

  async isElementVisible(
    selector: DualSelector,
    timeout: number = Timeout.FIVE_SECONDS,
  ): Promise<boolean> {
    try {
      const element = await this.resolve(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  async click(selector: DualSelector) {
    Logger.info(`Clicking element: ${selector.log}`);
    const element = await this.waitUntilVisibleWithRetry(selector);

    await element.click();
  }

  async type(selector: DualSelector, value: string) {
    Logger.info(`Typing "${value}" into element: ${selector.log}`);
    const element = await this.getElement(selector);

    if (driver.isIOS && (await this.isSecureField(element))) {
      await this.typeIntoSecureField(element, value);
      return;
    }

    await element.clearValue();
    await element.setValue(value);
  }

  private async isSecureField(element: MobileElement) {
    const type = await element.getAttribute("type").catch(() => "");
    return type === "XCUIElementTypeSecureTextField";
  }

  // clearValue() can't clear an iOS password field, so delete the masked
  // characters one by one and check the typed length.
  private async typeIntoSecureField(element: MobileElement, value: string) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const masked = (await element.getAttribute("value")) || "";
      if (/^•+$/.test(masked)) {
        await element.click();
        await element.addValue("\uE003".repeat(masked.length));
      }

      await element.addValue(value);

      const typed = (await element.getAttribute("value")) || "";
      if (typed.length === value.length) {
        return;
      }
      Logger.info(
        `[Attempt ${attempt}] secure field holds ${typed.length} chars instead of ${value.length} - retyping`,
      );
    }

    throw new Error(`Could not type into secure field after 3 attempts`);
  }

  async hideKeyboard() {
    if (await driver.isKeyboardShown().catch(() => false)) {
      Logger.info("Hiding keyboard");
      await driver.hideKeyboard().catch(() => undefined);
    }
  }

  async getText(selector: DualSelector): Promise<string> {
    const element = await this.resolve(selector);
    const text = await element.getText();
    Logger.info(`Element text: "${text}"`);
    return text;
  }

  async assertElementDisplayed(selector: DualSelector): Promise<void> {
    Logger.info(`Checking visibility of element: ${selector.log}`);
    const element = await this.waitUntilVisibleWithRetry(selector);
    const visible = await element.isDisplayed();
    expect(visible).toBe(true);
  }

  async assertElementNotDisplayed(selector: DualSelector): Promise<void> {
    Logger.info(`Checking element is not displayed: ${selector.log}`);
    const element = await this.resolve(selector);
    const visible = await element.isDisplayed().catch(() => false);
    expect(visible).not.toBe(true);
  }

  async assertTextEquals(
    selector: DualSelector,
    expected: string,
    timeout: number = Timeout.FIVE_SECONDS,
  ) {
    const element = await this.resolve(selector);
    await browser
      .waitUntil(async () => (await element.getText()) === expected, { timeout })
      .catch(() => undefined);
    const text = await this.getText(selector);
    expect(text).toBe(expected);
  }

  async assertElementEnabled(selector: DualSelector, enabled = true) {
    Logger.info(
      `Asserting ${selector.log} is ${enabled ? "enabled" : "disabled"}`,
    );
    const element = await this.resolve(selector);
    expect(await element.isEnabled()).toBe(enabled);
  }

  async assertTextVisible(text: string) {
    await this.assertElementDisplayed(textSelector(text));
  }

  async assertTextNotVisible(text: string) {
    expect(
      await this.isElementVisible(textSelector(text), Timeout.ONE_SECOND),
    ).toBe(false);
  }

  async assertAlert(title: string, message: string) {
    await this.waitUntilVisibleWithRetry(this.alertTitle);
    await this.assertTextEquals(this.alertTitle, title);
    await this.assertTextEquals(this.alertMessage, message);
    await this.assertElementDisplayed(this.alertOkButton);
  }

  async acceptAlert() {
    await this.click(this.alertOkButton);
    await browser.waitUntil(
      async () => !(await this.isElementVisible(this.alertTitle, Timeout.ONE_SECOND)),
      {
        timeout: Timeout.TEN_SECONDS,
        timeoutMsg: "Alert was still on screen after tapping OK",
      },
    );
  }
}
