import { describe, it, expect } from "vitest";
import { sessionOptions } from "../session";

describe("session config", () => {
  it("has correct cookie name", () => {
    expect(sessionOptions.cookieName).toBe("sapir_session");
  });
  it("has httpOnly cookies", () => {
    expect(sessionOptions.cookieOptions?.httpOnly).toBe(true);
  });
});
