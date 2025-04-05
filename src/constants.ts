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
  starty: -165,
  gridradius: 50,
  targetradius: 35,
  ballradius: 30,
  speed: 15,
};

export function walls(c: Constants) {
  return {
    top: -c.topmargin,
    left: -c.margin,
    right: c.gridradius * 2 * c.columns + c.margin,
    bottom: c.gridradius * 2 * c.rows,
  };
}
