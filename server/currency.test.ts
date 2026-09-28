import { describe, expect, it } from "vitest";
import { convertFromBaseAmount, convertToBaseAmount } from "../shared/currency";

describe("currency conversion precision", () => {
  it("round-trips a ₹100 input to ₹100.00 after four-decimal USD storage", () => {
    const storedUsd = Number(convertToBaseAmount(100, "INR").toFixed(4));
    const displayedInr = convertFromBaseAmount(storedUsd, "INR");

    expect(displayedInr.toFixed(2)).toBe("100.00");
  });

  it("does not change USD inputs", () => {
    expect(convertToBaseAmount(99.6, "USD")).toBe(99.6);
    expect(convertFromBaseAmount(99.6, "USD")).toBe(99.6);
  });
});
