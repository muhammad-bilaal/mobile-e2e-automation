import { browser } from "@wdio/globals";

export async function getPlatform(): Promise<"android" | "ios"> {
  const platformName = String(browser.capabilities.platformName || "").toLowerCase();
  return platformName.includes("android") ? "android" : "ios";
}
