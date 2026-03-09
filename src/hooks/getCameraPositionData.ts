import { OVERVIEW_CAMERA, SECTION_CAMERAS } from '../types/sections'
import type { SectionId, CameraPosition } from '../types/sections'

export function getCameraPositionData() {
  function getPosition(section: SectionId | null): CameraPosition {
    return section === null ? OVERVIEW_CAMERA : SECTION_CAMERAS[section]
  }

  return { getPosition, OVERVIEW_CAMERA, SECTION_CAMERAS }
}
