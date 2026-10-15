import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mapTransitionToMotion } from '../src/lib/mercury/utils.ts';

const previousWindow = globalThis.window;
const previousHTMLElement = globalThis.HTMLElement;
const previousSVGElement = globalThis.SVGElement;
// Motion checks these constructors even when animating a plain object.
globalThis.HTMLElement = class HTMLElement {};
globalThis.SVGElement = class SVGElement {};
const previousFrame = globalThis.requestAnimationFrame;
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(performance.now()), 16);
const { animateEffectSubject, propEffect, frame } = await import('motion');
const nextFrame = () => new Promise((resolve) => frame.postRender(resolve));

after(() => {
	if (previousHTMLElement === undefined) delete globalThis.HTMLElement;
	else globalThis.HTMLElement = previousHTMLElement;
	if (previousSVGElement === undefined) delete globalThis.SVGElement;
	else globalThis.SVGElement = previousSVGElement;
	if (previousWindow === undefined) delete globalThis.window;
	else globalThis.window = previousWindow;
	if (previousFrame === undefined) delete globalThis.requestAnimationFrame;
	else globalThis.requestAnimationFrame = previousFrame;
});

function preference(matches) {
	globalThis.window = { matchMedia: () => ({ matches }) };
}

test('reduced motion settles position immediately and keeps a short opacity fade', async () => {
	preference(true);
	const subject = { x: 0, opacity: 0 };
	const animations = animateEffectSubject(
		propEffect,
		subject,
		{ x: 100, opacity: 1 },
		mapTransitionToMotion({ type: 'spring', duration: 0.5, bounce: 0.2, delay: 0.3 })
	);
	await nextFrame();
	await nextFrame();
	assert.equal(subject.x, 100);
	assert.ok(subject.opacity < 1, 'opacity should still be fading');
	await Promise.all(animations);
	assert.equal(subject.opacity, 1);
});

test('reduced motion completes an otherwise infinite loop', { timeout: 1500 }, async () => {
	preference(true);
	const subject = { opacity: 0.2 };
	const animations = animateEffectSubject(
		propEffect,
		subject,
		{ opacity: [0.2, 1] },
		mapTransitionToMotion({ duration: 5, repeat: Infinity, repeatDelay: 1, ease: 'linear' })
	);
	await Promise.all(animations);
	assert.equal(subject.opacity, 1);
});

test('normal preference preserves an animated duration spring', async () => {
	preference(false);
	const subject = { x: 0 };
	const animations = animateEffectSubject(
		propEffect,
		subject,
		{ x: 100 },
		mapTransitionToMotion({ type: 'spring', duration: 0.3, bounce: 0 })
	);
	await nextFrame();
	await nextFrame();
	assert.ok(subject.x >= 0 && subject.x < 100, 'position should animate across frames');
	await Promise.all(animations);
	assert.equal(subject.x, 100);
});
