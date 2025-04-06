import { vec2 } from "./vec2";

export type Constants = {
  framemsec: number;
  stepsPerFrame: number;
  dt: number;
  gravity: number;
  columns: number;
  rows: number;
  margin: number;
  topmargin: number;
  starty: number;
  gridradius: number;
  targetradius: number;
  ballradius: number;
  speed: number;
};

export const constants: Constants = {
  framemsec: 15,
  stepsPerFrame: 1,
  dt: 1,
  gravity: 2,
  columns: 5,
  rows: 5,
  margin: 65,
  topmargin: 200,
  starty: -75,
  gridradius: 55,
  targetradius: 35,
  ballradius: 30,
  speed: 27,
};

export function defaultPos(c: Constants) {
  return vec2(c.columns * c.gridradius, c.starty);
}

export function walls(c: Constants) {
  return {
    top: -c.topmargin,
    left: -c.margin,
    right: c.gridradius * 2 * c.columns + c.margin,
    bottom: c.gridradius * 2 * c.rows,
  };
}
