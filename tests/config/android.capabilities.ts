import path from "path";

export const androidCaps = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:udid": process.env.ANDROID_UDID,
  "appium:app": path.resolve(__dirname, "../apps", "wdio-demo.apk"),
  "appium:appWaitActivity": "com.wdiodemoapp.MainActivity",
  "appium:autoGrantPermissions": true,
  "appium:newCommandTimeout": 240,
  "appium:uiautomator2ServerInstallTimeout": 120000,
  "appium:adbExecTimeout": 120000,
  "appium:noReset": false,
};
