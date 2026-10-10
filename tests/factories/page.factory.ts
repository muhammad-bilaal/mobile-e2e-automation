export type DualSelector = {
  android: string;
  ios: string;
  name?: string;
  readonly log: string;
};

export function selector(
  android: string,
  ios: string,
  name?: string,
): DualSelector {
  return {
    android,
    ios,
    name,
    get log() {
      return name ?? JSON.stringify({ android, ios });
    },
  };
}

export function textSelector(text: string, name?: string): DualSelector {
  return selector(
    `android=new UiSelector().text("${text}")`,
    `-ios predicate string:label == "${text}" OR value == "${text}"`,
    name ?? `"${text}" text`,
  );
}

export function resolveLocator(
  dual: DualSelector,
  platform: "android" | "ios",
): string {
  return dual[platform];
}
