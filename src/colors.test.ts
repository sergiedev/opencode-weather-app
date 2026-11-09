import { describe, expect, test } from "bun:test";
import { createTheme, shouldUseColor } from "./colors.ts";

const ESCAPE = "\u001b[";

describe("createTheme", () => {
  test("returns plain text when colors are disabled", () => {
    const theme = createTheme(false);

    expect(theme.enabled).toBe(false);
    expect(theme.temperature("6 °C")).toBe("6 °C");
    expect(theme.success("ok")).toBe("ok");
  });

  test("wraps text with the matching ANSI code when enabled", () => {
    const theme = createTheme(true);

    expect(theme.menu("1.")).toBe(`${ESCAPE}36m1.${ESCAPE}0m`);
    expect(theme.title("WEATHER CLI")).toBe(`${ESCAPE}36mWEATHER CLI${ESCAPE}0m`);
    expect(theme.temperature("6 °C")).toBe(`${ESCAPE}33m6 °C${ESCAPE}0m`);
    expect(theme.success("ok")).toBe(`${ESCAPE}32mok${ESCAPE}0m`);
    expect(theme.error("boom")).toBe(`${ESCAPE}31mboom${ESCAPE}0m`);
    expect(theme.muted("...")).toBe(`${ESCAPE}2m...${ESCAPE}0m`);
  });
});

describe("shouldUseColor", () => {
  test("requires an interactive stream", () => {
    expect(shouldUseColor({ isTTY: true }, {})).toBe(true);
    expect(shouldUseColor({ isTTY: false }, {})).toBe(false);
    expect(shouldUseColor(undefined, {})).toBe(false);
  });

  test("honors NO_COLOR and FORCE_COLOR", () => {
    expect(shouldUseColor({ isTTY: true }, { NO_COLOR: "1" })).toBe(false);
    expect(shouldUseColor({ isTTY: false }, { FORCE_COLOR: "1" })).toBe(true);
  });
});
