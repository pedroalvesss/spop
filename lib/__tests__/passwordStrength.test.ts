import { describe, expect, it } from "vitest";
import { getPasswordScore } from "../passwordStrength";

describe("getPasswordScore", () => {
  it.each([
    ["", 0],
    ["abc", 1],
    ["abcdef", 2],
    ["abcdefgh", 2],
    ["abcdefghi", 3],
    ["123456789", 3],
    ["abcd12345", 4],
  ])("%j vale %i", (password, score) => {
    expect(getPasswordScore(password)).toBe(score);
  });
});
