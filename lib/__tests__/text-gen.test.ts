import { describe, it, expect } from "vitest";
import { checkVoiceCompliance } from "../text-gen";

describe("checkVoiceCompliance", () => {
  it("flags em dash", () => {
    expect(checkVoiceCompliance("המתכון הזה — מטורף")).toContain("contains em/en dash");
  });
  it("flags banned words", () => {
    const issues = checkVoiceCompliance("עוגה ראויה ומתוחכמת");
    expect(issues.some((i) => i.includes("ראויה"))).toBe(true);
    expect(issues.some((i) => i.includes("מתוחכמת"))).toBe(true);
  });
  it("passes clean text", () => {
    expect(checkVoiceCompliance("עוגה פשוטה וטעימה")).toEqual([]);
  });
});
