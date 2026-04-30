import { describe, it, expect } from "vitest";
import { scaleQuantity } from "../scaling-ingredients";

describe("scaleQuantity", () => {
  it("doubles whole numbers", () => {
    expect(scaleQuantity("5", 2)).toBe("10");
  });
  it("handles decimals cleanly", () => {
    expect(scaleQuantity("1.5", 2)).toBe("3");
  });
  it("trims trailing zeros", () => {
    expect(scaleQuantity("1", 1.5)).toBe("1.5");
  });
  it("preserves non-numeric strings", () => {
    expect(scaleQuantity("קמצוץ", 2)).toBe("קמצוץ");
  });
});
