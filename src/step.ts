import { Constants } from "./constants";
import { GameState } from "./gamestate";
import {
  vec2,
  vec_add,
  vec_d2,
  vec_fma,
  vec_len,
  vec_reflect,
  vec_scale,
  vec_sub,
  vec_to_local,
  vec_unit,
} from "./vec2";

export function step(state: GameState, dt: number, c: Constants) {
  const maxd = c.targetradius + c.ballradius;
  const maxd2 = maxd ** 2;
  let newpos = vec_fma(state.position, dt, state.velocity);
  let newvel = state.velocity;

  const x1 = ((newpos.x - maxd) / (2 * c.gridradius)) | 0;
  const x2 = ((newpos.x + maxd) / (2 * c.gridradius)) | 0;
  const y1 = ((newpos.y - maxd) / (2 * c.gridradius)) | 0;
  const y2 = ((newpos.y + maxd) / (2 * c.gridradius)) | 0;
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
      state.points += 2 ** state.values[index];
      state.values[index] -= 1;
      if (state.values[index] < 0) continue;
      // Bounce!
      const local = vec_to_local(
        vec_unit(newvel),
        vec_sub(state.position, gridcenter),
      );
      const circx = -((maxd2 - local.y ** 2) ** 0.5);
      const d = (circx - local.x) / vec_len(newvel);
      newpos = vec_fma(state.position, d, newvel);
      newvel = vec_reflect(vec_unit(vec_sub(newpos, gridcenter)), newvel);
    }
  }
  state.position = newpos;
  state.velocity = vec_add(newvel, vec2(0, dt * c.gravity));
}
