const ANSI = {
  cyan: 36,
  yellow: 33,
  green: 32,
  red: 31,
  dim: 2,
} as const;

type ColorName = keyof typeof ANSI;
type StyleName = "menu" | "title" | "temperature" | "success" | "error" | "muted";

export interface Theme {
  readonly enabled: boolean;
  menu(text: string): string;
  title(text: string): string;
  temperature(text: string): string;
  success(text: string): string;
  error(text: string): string;
  muted(text: string): string;
}

interface ColorStream {
  isTTY?: boolean;
}

const STYLES: Record<StyleName, ColorName> = {
  menu: "cyan",
  title: "cyan",
  temperature: "yellow",
  success: "green",
  error: "red",
  muted: "dim",
};

export function createTheme(enabled: boolean): Theme {
  const paint = (color: ColorName, text: string): string =>
    enabled ? `\u001b[${ANSI[color]}m${text}\u001b[0m` : text;

  return {
    enabled,
    menu: (text) => paint(STYLES.menu, text),
    title: (text) => paint(STYLES.title, text),
    temperature: (text) => paint(STYLES.temperature, text),
    success: (text) => paint(STYLES.success, text),
    error: (text) => paint(STYLES.error, text),
    muted: (text) => paint(STYLES.muted, text),
  };
}

export function shouldUseColor(
  stream: unknown,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NO_COLOR) return false;
  if (env.FORCE_COLOR) return true;
  if (typeof stream !== "object" || stream === null) return false;
  return (stream as ColorStream).isTTY === true;
}
