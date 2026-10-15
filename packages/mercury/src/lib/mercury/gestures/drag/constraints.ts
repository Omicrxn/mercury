import { calcLength, clamp, mixNumber, progress, type BoundingBox, type DragElastic } from 'motion';

// Ported from framer-motion (MIT, Copyright (c) 2018 Framer B.V.).

export type Axis = { min: number; max: number };
export type Box = { x: Axis; y: Axis };
export type AxisConstraints = { min?: number; max?: number };
export type ResolvedConstraints = { x: AxisConstraints; y: AxisConstraints };
export type ResolvedElastic = { x: Axis; y: Axis };

/**
 * Apply constraints to a point. These constraints are both physical along an
 * axis, and an elastic factor that determines how much to constrain the point
 * by if it does lie outside the defined parameters.
 */
export function applyConstraints(point: number, { min, max }: AxisConstraints, elastic?: Axis) {
	if (min !== undefined && point < min) {
		point = elastic ? mixNumber(min, point, elastic.min) : Math.max(point, min);
	} else if (max !== undefined && point > max) {
		point = elastic ? mixNumber(max, point, elastic.max) : Math.min(point, max);
	}
	return point;
}

/**
 * Calculate constraints in terms of the viewport when defined relatively to the
 * measured axis. This is measured from the nearest edge, so a max constraint of 200
 * on an axis with a max value of 300 would return a constraint of 500 - axis length
 */
export function calcRelativeAxisConstraints(axis: Axis, min?: number, max?: number) {
	return {
		min: min !== undefined ? axis.min + min : undefined,
		max: max !== undefined ? axis.max + max - (axis.max - axis.min) : undefined
	};
}

/** Calculate constraints in terms of the viewport when defined relatively to the measured bounding box. */
export function calcRelativeConstraints(
	layoutBox: Box,
	{ top, left, bottom, right }: Partial<BoundingBox>
): ResolvedConstraints {
	return {
		x: calcRelativeAxisConstraints(layoutBox.x, left, right),
		y: calcRelativeAxisConstraints(layoutBox.y, top, bottom)
	};
}

/** Calculate viewport constraints when defined as another viewport-relative axis */
export function calcViewportAxisConstraints(layoutAxis: Axis, constraintsAxis: Axis) {
	let min = constraintsAxis.min - layoutAxis.min;
	let max = constraintsAxis.max - layoutAxis.max;
	// If the constraints axis is actually smaller than the layout axis then we can
	// flip the constraints
	if (constraintsAxis.max - constraintsAxis.min < layoutAxis.max - layoutAxis.min) {
		[min, max] = [max, min];
	}
	return { min, max };
}

/** Calculate viewport constraints when defined as another viewport-relative box */
export function calcViewportConstraints(layoutBox: Box, constraintsBox: Box): ResolvedConstraints {
	return {
		x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
		y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y)
	};
}

/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an aesthetically pleasing scale/transform needed to project from source to target.
 */
export function calcOrigin(source: Axis, target: AxisConstraints) {
	let origin = 0.5;
	const sourceLength = calcLength(source);
	const targetLength = calcLength(target as Axis);
	if (targetLength > sourceLength) {
		origin = progress(target.min!, target.max! - sourceLength, source.min);
	} else if (sourceLength > targetLength) {
		origin = progress(source.min, source.max - targetLength, target.min!);
	}
	return clamp(0, 1, origin);
}

/** Rebase the calculated viewport constraints relative to the layout.min point. */
export function rebaseAxisConstraints(layout: Axis, constraints: AxisConstraints) {
	const relativeConstraints: AxisConstraints = {};
	if (constraints.min !== undefined) {
		relativeConstraints.min = constraints.min - layout.min;
	}
	if (constraints.max !== undefined) {
		relativeConstraints.max = constraints.max - layout.min;
	}
	return relativeConstraints;
}

export const defaultElastic = 0.35;

/** Accepts a dragElastic prop and returns resolved elastic values for each axis. */
export function resolveDragElastic(dragElastic: DragElastic = defaultElastic): ResolvedElastic {
	if (dragElastic === false) {
		dragElastic = 0;
	} else if (dragElastic === true) {
		dragElastic = defaultElastic;
	}
	return {
		x: resolveAxisElastic(dragElastic, 'left', 'right'),
		y: resolveAxisElastic(dragElastic, 'top', 'bottom')
	};
}

function resolveAxisElastic(
	dragElastic: number | Partial<BoundingBox>,
	minLabel: keyof BoundingBox,
	maxLabel: keyof BoundingBox
): Axis {
	return {
		min: resolvePointElastic(dragElastic, minLabel),
		max: resolvePointElastic(dragElastic, maxLabel)
	};
}

function resolvePointElastic(dragElastic: number | Partial<BoundingBox>, label: keyof BoundingBox) {
	return typeof dragElastic === 'number' ? dragElastic : dragElastic[label] || 0;
}
