import { describe, it, expect } from "vitest";
import { INITIAL_ORIENTATION, SECTION_ORIENTATIONS } from "../sections";

const PITCH_MAX = (70 * Math.PI) / 180;

describe("INITIAL_ORIENTATION", () => {
  it("position に NaN が含まれないこと", () => {
    const [x, y, z] = INITIAL_ORIENTATION.position;
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
    expect(isNaN(z)).toBe(false);
  });

  it("yaw が NaN でないこと", () => {
    expect(isNaN(INITIAL_ORIENTATION.yaw)).toBe(false);
  });

  it("pitch が NaN でないこと", () => {
    expect(isNaN(INITIAL_ORIENTATION.pitch)).toBe(false);
  });

  it("初期値が正しいこと", () => {
    expect(INITIAL_ORIENTATION.position).toEqual([0, 1.6, 1.5]);
    expect(INITIAL_ORIENTATION.yaw).toBe(0);
    expect(INITIAL_ORIENTATION.pitch).toBe(0);
  });
});

describe("SECTION_ORIENTATIONS", () => {
  const sectionIds = ["profile", "skills", "works", "contact"] as const;

  sectionIds.forEach((id) => {
    describe(`${id}`, () => {
      it("position に NaN が含まれないこと", () => {
        const [x, y, z] = SECTION_ORIENTATIONS[id].position;
        expect(isNaN(x)).toBe(false);
        expect(isNaN(y)).toBe(false);
        expect(isNaN(z)).toBe(false);
      });

      it("yaw が NaN でないこと", () => {
        expect(isNaN(SECTION_ORIENTATIONS[id].yaw)).toBe(false);
      });

      it("pitch が NaN でないこと", () => {
        expect(isNaN(SECTION_ORIENTATIONS[id].pitch)).toBe(false);
      });

      it(`pitch が ±70° の範囲内であること`, () => {
        const pitch = SECTION_ORIENTATIONS[id].pitch;
        expect(pitch).toBeGreaterThanOrEqual(-PITCH_MAX);
        expect(pitch).toBeLessThanOrEqual(PITCH_MAX);
      });
    });
  });

  it("全4セクションが定義されていること", () => {
    expect(Object.keys(SECTION_ORIENTATIONS)).toHaveLength(4);
  });
});
