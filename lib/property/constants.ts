/**
 * Central measurement constants for the property engine.
 *
 * SCALE CONVENTION — the normalized property model is metric:
 *   1 model unit = 1 metre, X = east across the plan, Y (plan space) = south.
 * In 3D, plan (x, y) maps to world (x, z) and elevation maps to world y.
 * The renderer may uniformly scale a whole property group to fit an existing
 * scene, but every number stored in a PropertyModel is metres.
 */

export const DEFAULT_CEILING_HEIGHT = 2.4; // m, per floor unless overridden
export const FLOOR_SLAB_THICKNESS = 0.25; // m, structural depth between storeys

export const DEFAULT_EXTERNAL_WALL_THICKNESS = 0.3; // m
export const DEFAULT_INTERNAL_WALL_THICKNESS = 0.1; // m

export const WINDOW_DEFAULTS = {
  width: 1.2, // m
  sillHeight: 0.9, // m above floor
  headHeight: 2.1, // m above floor
  frameDepthRatio: 0.5, // frame depth as a fraction of wall thickness
};

export const DOOR_DEFAULTS = {
  internalWidth: 0.84, // m (UK 838 mm leaf + frame, rounded)
  externalWidth: 0.95, // m
  patioWidth: 1.8, // m glazed pair/slider
  height: 2.04, // m head above floor
  leafThickness: 0.045, // m
  ajarAngle: 0.5, // rad — internal leaves sit ajar in the dollhouse
};

export const BALCONY_DEFAULTS = {
  railHeight: 1.05, // m
  railThickness: 0.08, // m
};

/** joinery frame section (jambs / mullions), m */
export const FRAME_SECTION = 0.06;
