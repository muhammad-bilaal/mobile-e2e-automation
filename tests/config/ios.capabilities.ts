import path from "path";

export const iosCaps = {
  platformName: "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": process.env.IOS_DEVICE_NAME || "iPhone 16",
  "appium:platformVersion": process.env.IOS_PLATFORM_VERSION || "18.4",
  "appium:udid": process.env.IOS_UDID,
  "appium:app": path.resolve(__dirname, "../apps", "wdio-demo.app"),
  "appium:newCommandTimeout": 240,
  "appium:wdaLaunchTimeout": 300000,
  "appium:wdaConnectionTimeout": 300000,
  // The default typing speed drops characters on slower simulators.
  "appium:maxTypingFrequency": 20,
  "appium:noReset": false,
};
