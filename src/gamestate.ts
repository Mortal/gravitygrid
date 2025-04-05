import { Vec2 } from "./vec2";

export type GameState = {
  values: number[];
  position: Vec2;
  velocity: Vec2;
  points: number;
};

export function state_clone(s: GameState): GameState {
  return {
    values: [...s.values],
    position: { x: s.position.x, y: s.position.y },
    velocity: { x: s.velocity.x, y: s.velocity.y },
    points: s.points,
  };
}
