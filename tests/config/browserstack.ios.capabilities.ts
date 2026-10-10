const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

export const browserstackIosCaps = {
  platformName: "iOS",
  "appium:platformVersion": "17",
  "appium:deviceName": "iPhone 15",
  "appium:automationName": "XCUITest",
  "appium:app": process.env.BROWSERSTACK_APP_ID,
  "appium:newCommandTimeout": 300,
  "appium:noReset": false,
  "bstack:options": {
    projectName: "Mobile Automation Demo",
    buildName: `iOS Tests ${timestamp}`,
    sessionName: "iOS Test Session",
    debug: true,
    networkLogs: true,
    video: true,
    appiumLogs: true,
    deviceLogs: true,
  },
};
