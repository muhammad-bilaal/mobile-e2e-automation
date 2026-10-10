import allureReporter from "@wdio/allure-reporter";

export async function step(name: string, action: () => Promise<void>) {
  allureReporter.startStep(name);
  try {
    await action();
    allureReporter.endStep();
  } catch (err) {
    allureReporter.endStep();
    throw err;
  }
}

export function generatePasswordByLength(length: number): string {
  const base = "Abc12345xyz!@#";
  return base.slice(0, length);
}
