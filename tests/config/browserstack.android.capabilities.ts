const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

export const browserstackAndroidCaps = {
  platformName: "Android",
  "appium:platformVersion": "14.0",
  "appium:deviceName": "Google Pixel 8",
  "appium:automationName": "UiAutomator2",
  "appium:app": process.env.BROWSERSTACK_APP_ID,
  "appium:autoGrantPermissions": true,
  "appium:newCommandTimeout": 300,
  "appium:noReset": false,
  "bstack:options": {
    projectName: "Mobile Automation Demo",
    buildName: `Android Tests ${timestamp}`,
    sessionName: "Android Test Session",
    debug: true,
    networkLogs: true,
    video: true,
    appiumLogs: true,
    deviceLogs: true,
  },
};
