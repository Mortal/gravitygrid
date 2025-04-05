import { Constants, walls } from "./constants";
import { GameState } from "./gamestate";
import {
  vec2,
  vec_add,
  vec_d2,
  vec_fma,
  vec_len,
  vec_reflect,
  vec_sub,
  vec_to_local,
  vec_unit,
} from "./vec2";

export function step(state: GameState, dt: number, c: Constants) {
  const maxd = c.targetradius + c.ballradius;
  const maxd2 = maxd ** 2;
  let actualdt = dt;
  let newpos = vec_fma(state.position, actualdt, state.velocity);
  let newvel = state.velocity;

  const x1 = ((newpos.x - maxd) / (2 * c.gridradius)) | 0;
  const x2 = ((newpos.x + maxd) / (2 * c.gridradius)) | 0;
  const y1 = ((newpos.y - maxd) / (2 * c.gridradius)) | 0;
  const y2 = ((newpos.y + maxd) / (2 * c.gridradius)) | 0;
  let bouncex = -1;
  let bouncey = -1;
  for (let x = x1; x <= x2; ++x) {
    if (!(0 <= x && x < c.columns)) continue;
    for (let y = y1; y <= y2; ++y) {
      if (y < 0) continue;
      const index = y * c.columns + x;
      if (index >= state.values.length || state.values[index] < 0) continue;
      const gridcenter = vec2(
        (x * 2 + 1) * c.gridradius,
        (y * 2 + 1) * c.gridradius,
      );
      const d2 = vec_d2(gridcenter, newpos);
      if (d2 > maxd2) continue;
      // Pop!
      if (state.values[index] === 0) {
        state.points += 2 ** state.values[index];
        state.values[index] -= 1;
        continue;
      }
      // Bounce!
      const local = vec_to_local(
        vec_unit(newvel),
        vec_sub(state.position, gridcenter),
      );
      const circx = -((maxd2 - local.y ** 2) ** 0.5);
      actualdt = (circx - local.x) / vec_len(newvel);
      bouncex = x;
      bouncey = y;
      newpos = vec_fma(state.position, actualdt, newvel);
    }
  }
  const { left, right, top } = walls(c);
  if (newpos.x < left + c.ballradius && newvel.x < 0) {
    actualdt = (left + c.ballradius - state.position.x) / newvel.x;
    newpos = vec_fma(state.position, actualdt, newvel);
    newvel = vec_reflect(vec2(-1, 0), newvel);
  } else if (newpos.x > right - c.ballradius && newvel.x > 0) {
    actualdt = (right - c.ballradius - state.position.x) / newvel.x;
    newpos = vec_fma(state.position, actualdt, newvel);
    newvel = vec_reflect(vec2(1, 0), newvel);
  } else if (newpos.y < top + c.ballradius && newvel.y < 0) {
    actualdt = (top + c.ballradius - state.position.y) / newvel.y;
    newvel = vec_reflect(vec2(0, -1), newvel);
  } else if (bouncex >= 0 && bouncey >= 0) {
    const gridcenter = vec2(
      (bouncex * 2 + 1) * c.gridradius,
      (bouncey * 2 + 1) * c.gridradius,
    );
    const index = bouncey * c.columns + bouncex;
    newvel = vec_reflect(vec_unit(vec_sub(newpos, gridcenter)), newvel);
    state.points += 2 ** state.values[index];
    state.values[index] -= 1;
  }
  state.position = newpos;
  state.velocity = vec_add(newvel, vec2(0, dt * c.gravity));
}
