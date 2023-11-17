import { writable } from "svelte/store";

type NotVector3 = { x: number; z: number };

type positionByAxisType = {
    [axisNumber: number]: NotVector3;
};

const positionByAxis: positionByAxisType = {};

export const setPosition = (axisNumber: number, position: NotVector3) => {
    positionByAxis[axisNumber] = position;
};

export const getPosition = (axisNumber: number) => positionByAxis[axisNumber];

export const radius = writable(1.5);
export const rotation = writable(0);
export const diskHeight = writable(0.5);
export const speed = writable(0.1);
export const movement = writable(0.1);
export const control = writable(true);

export const circleIntersection = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    // Calculate the distance between the two centers
    const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    // Check for no intersection or one circle inside the other
    if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
        return [null, null]; // No intersection
    }

    // Check for concentric circles
    if (d === 0 && r1 === r2) {
        return [
            { x: x2, y: y2 },
            { x: x2, y: y2 },
        ]; // infinite
    }

    // Calculate the intersection points
    const a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(r1 ** 2 - a ** 2);

    const x3 = x1 + (a * (x2 - x1)) / d;
    const y3 = y1 + (a * (y2 - y1)) / d;

    // Calculate intersection points
    const intersection1 = {
        x: x3 + (h * (y2 - y1)) / d,
        y: y3 - (h * (x2 - x1)) / d,
    };

    const intersection2 = {
        x: x3 - (h * (y2 - y1)) / d,
        y: y3 + (h * (x2 - x1)) / d,
    };

    return [intersection1, intersection2];
};

export type ChangedType = {
    [s: string]: () => [number, number];
};
