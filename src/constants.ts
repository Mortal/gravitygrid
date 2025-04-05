export type Constants = {
  framemsec: number;
  stepsPerFrame: number;
  dt: number;
  gravity: number;
  columns: number;
  margin: number;
  gridradius: number;
  targetradius: number;
  ballradius: number;
  speed: number;
};

export const constants: Constants = {
  framemsec: 15,
  stepsPerFrame: 1,
  dt: 0.5,
  gravity: 2,
  columns: 5,
  margin: 25,
  gridradius: 50,
  targetradius: 35,
  ballradius: 30,
  speed: 15,
};
