import { describe, it, expect } from "vitest";
import {
  REAL_INITIAL_ORIENTATION,
  REAL_SECTION_ORIENTATIONS,
  REAL_ROOM_BOUNDS,
  VTUBER_INITIAL_ORIENTATION,
  VTUBER_SECTION_ORIENTATIONS,
  VTUBER_ROOM_BOUNDS,
  SCENE_ROOM_BOUNDS,
} from "../sections";

const PITCH_MAX = (70 * Math.PI) / 180;

describe("REAL_INITIAL_ORIENTATION", () => {
  it("position に NaN が含まれないこと", () => {
    const [x, y, z] = REAL_INITIAL_ORIENTATION.position;
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
    expect(isNaN(z)).toBe(false);
  });

  it("yaw が NaN でないこと", () => {
    expect(isNaN(REAL_INITIAL_ORIENTATION.yaw)).toBe(false);
  });

  it("pitch が NaN でないこと", () => {
    expect(isNaN(REAL_INITIAL_ORIENTATION.pitch)).toBe(false);
  });

  it("初期値が正しいこと", () => {
    expect(REAL_INITIAL_ORIENTATION.position).toEqual([0, 1.6, 1.5]);
    expect(REAL_INITIAL_ORIENTATION.yaw).toBe(0);
    expect(REAL_INITIAL_ORIENTATION.pitch).toBe(0);
  });
});

describe("REAL_SECTION_ORIENTATIONS", () => {
  const sectionIds = ["profile", "skills", "works", "contact"] as const;

  sectionIds.forEach((id) => {
    describe(`${id}`, () => {
      it("position に NaN が含まれないこと", () => {
        const [x, y, z] = REAL_SECTION_ORIENTATIONS[id].position;
        expect(isNaN(x)).toBe(false);
        expect(isNaN(y)).toBe(false);
        expect(isNaN(z)).toBe(false);
      });

      it("yaw が NaN でないこと", () => {
        expect(isNaN(REAL_SECTION_ORIENTATIONS[id].yaw)).toBe(false);
      });

      it("pitch が NaN でないこと", () => {
        expect(isNaN(REAL_SECTION_ORIENTATIONS[id].pitch)).toBe(false);
      });

      it(`pitch が ±70° の範囲内であること`, () => {
        const pitch = REAL_SECTION_ORIENTATIONS[id].pitch;
        expect(pitch).toBeGreaterThanOrEqual(-PITCH_MAX);
        expect(pitch).toBeLessThanOrEqual(PITCH_MAX);
      });
    });
  });

  it("全4セクションが定義されていること", () => {
    expect(Object.keys(REAL_SECTION_ORIENTATIONS)).toHaveLength(4);
  });
});

describe("VTUBER_INITIAL_ORIENTATION", () => {
  it("position に NaN が含まれないこと", () => {
    const [x, y, z] = VTUBER_INITIAL_ORIENTATION.position;
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
    expect(isNaN(z)).toBe(false);
  });

  it("yaw が NaN でないこと", () => {
    expect(isNaN(VTUBER_INITIAL_ORIENTATION.yaw)).toBe(false);
  });

  it("pitch が NaN でないこと", () => {
    expect(isNaN(VTUBER_INITIAL_ORIENTATION.pitch)).toBe(false);
  });
});

describe("VTUBER_SECTION_ORIENTATIONS", () => {
  const vtuberSectionIds = ["profile", "works", "guidelines", "links", "contact"] as const;

  vtuberSectionIds.forEach((id) => {
    describe(`${id}`, () => {
      it("position に NaN が含まれないこと", () => {
        const [x, y, z] = VTUBER_SECTION_ORIENTATIONS[id].position;
        expect(isNaN(x)).toBe(false);
        expect(isNaN(y)).toBe(false);
        expect(isNaN(z)).toBe(false);
      });

      it("yaw が NaN でないこと", () => {
        expect(isNaN(VTUBER_SECTION_ORIENTATIONS[id].yaw)).toBe(false);
      });

      it("pitch が NaN でないこと", () => {
        expect(isNaN(VTUBER_SECTION_ORIENTATIONS[id].pitch)).toBe(false);
      });

      it(`pitch が ±70° の範囲内であること`, () => {
        const pitch = VTUBER_SECTION_ORIENTATIONS[id].pitch;
        expect(pitch).toBeGreaterThanOrEqual(-PITCH_MAX);
        expect(pitch).toBeLessThanOrEqual(PITCH_MAX);
      });
    });
  });
});

describe("SCENE_ROOM_BOUNDS", () => {
  it("REAL と VTUBER の境界が定義されていること", () => {
    expect(SCENE_ROOM_BOUNDS.real).toEqual(REAL_ROOM_BOUNDS);
    expect(SCENE_ROOM_BOUNDS.virtual).toEqual(VTUBER_ROOM_BOUNDS);
    expect(REAL_ROOM_BOUNDS.xMin).toBeLessThan(REAL_ROOM_BOUNDS.xMax);
    expect(REAL_ROOM_BOUNDS.zMin).toBeLessThan(REAL_ROOM_BOUNDS.zMax);
    expect(VTUBER_ROOM_BOUNDS.xMin).toBeLessThan(VTUBER_ROOM_BOUNDS.xMax);
    expect(VTUBER_ROOM_BOUNDS.zMin).toBeLessThan(VTUBER_ROOM_BOUNDS.zMax);
  });
});
