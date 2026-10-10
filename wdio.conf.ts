import fs from "fs";
import allureReporter from "@wdio/allure-reporter";
import { androidCaps } from "./tests/config/android.capabilities";
import { iosCaps } from "./tests/config/ios.capabilities";
import { browserstackAndroidCaps } from "./tests/config/browserstack.android.capabilities";
import { browserstackIosCaps } from "./tests/config/browserstack.ios.capabilities";
import BasePage from "./tests/pages/base.page";
import Logger from "./tests/utils/logger";
import { Timeout } from "./tests/utils/timers";

const ENV = (process.env.ENV || "local").toLowerCase();
const PLATFORM = (process.env.PLATFORM || "android").toLowerCase();

function getCapabilities() {
  if (ENV === "browserstack") {
    return [PLATFORM === "ios" ? browserstackIosCaps : browserstackAndroidCaps];
  }

  return [PLATFORM === "ios" ? iosCaps : androidCaps];
}

function getServerConfig() {
  if (ENV === "browserstack") {
    return {
      protocol: "https",
      hostname: "hub.browserstack.com",
      port: 443,
      path: "/wd/hub",
      user: process.env.BROWSERSTACK_USERNAME,
      key: process.env.BROWSERSTACK_ACCESS_KEY,
    };
  }

  return {
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
  };
}

async function updateBrowserstackSession(action: string, args: object) {
  await browser.execute(
    `browserstack_executor: ${JSON.stringify({ action, arguments: args })}`,
  );
}

export const config: WebdriverIO.Config = {
  runner: "local",
  framework: "mocha",
  ...getServerConfig(),

  onPrepare: function () {
    fs.rmSync("allure-results", { recursive: true, force: true });
    Logger.info(`Running tests on ${PLATFORM} on ${ENV} environment`);
  },

  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
        reportedEnvironmentVars: { Platform: PLATFORM, Environment: ENV },
      },
    ],
  ],

  specs: ["./tests/specs/**/*.ts"],
  maxInstances: 1,
  capabilities: getCapabilities(),

  // The first session installs the app (and builds WebDriverAgent on iOS), which is slow on a cold device.
  connectionRetryTimeout: 300000,
  connectionRetryCount: 2,
  logLevel: "error",
  specFileRetries: process.env.CI ? 1 : 0,

  mochaOpts: {
    ui: "bdd",
    timeout: Timeout.FIVE_MINUTES,
  },

  beforeTest: async function (test) {
    allureReporter.addParentSuite(PLATFORM === "ios" ? "iOS" : "Android");

    if (ENV === "browserstack") {
      await updateBrowserstackSession("setSessionName", { name: test.title });
    } else {
      // Videos must be H.264 to play in the report: iOS records MJPEG by default
      // and the emulator encoder can't record at full Pixel resolution.
      const timeLimit = String(Timeout.FIVE_MINUTES / 1000);
      await browser.startRecordingScreen(
        driver.isIOS
          ? {
              videoType: "libx264",
              videoFps: 10,
              videoScale: "trunc(iw/4)*2:trunc(ih/4)*2",
              timeLimit,
              forceRestart: true,
            }
          : { videoSize: "576x1280", timeLimit, forceRestart: true },
      );
    }

    const basePage = new BasePage();
    await basePage.handleSystemDialogs();
  },

  afterTest: async function (test, _context, result) {
    try {
      const screenshotBase64 = await browser.takeScreenshot();

      allureReporter.addAttachment(
        `Screenshot - ${test.title}`,
        Buffer.from(screenshotBase64, "base64"),
        "image/png",
      );
    } catch (error) {
      Logger.info(`Could not capture screenshot for "${test.title}": ${error}`);
    }

    // BrowserStack records the video itself and shows it on its dashboard.
    if (ENV === "browserstack") {
      await updateBrowserstackSession("setSessionStatus", {
        status: result.passed ? "passed" : "failed",
        reason: result.passed ? test.title : result.error?.message || test.title,
      });
      return;
    }

    try {
      const videoBase64 = await browser.stopRecordingScreen();

      if (videoBase64) {
        allureReporter.addAttachment(
          `Video - ${test.title}`,
          Buffer.from(videoBase64, "base64"),
          "video/mp4",
        );
      }
    } catch (error) {
      Logger.info(`Could not capture video for "${test.title}": ${error}`);
    }
  },
};
