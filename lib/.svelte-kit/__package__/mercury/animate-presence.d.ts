import type { PresenceAnimation } from './animation-interface.js';
export declare const presence: (element: HTMLElement, params: PresenceAnimation, options: {
    direction: "in" | "out" | "both";
}) => {
    duration: number;
    delay: number;
    tick: (t: any) => void;
};
