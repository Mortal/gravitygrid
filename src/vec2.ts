export type Vec2 = { x: number; y: number };

export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export function vec_len(u: Vec2): number {
  return Math.hypot(u.x, u.y);
}

export function vec_lensq(u: Vec2): number {
  return u.x ** 2 + u.y ** 2;
}

export function vec_d2(u: Vec2, v: Vec2): number {
  return vec_lensq(vec_sub(u, v));
}

export function vec_unit(u: Vec2): Vec2 {
  const d = Math.hypot(u.x, u.y);
  return d ? vec2(u.x / d, u.y / d) : u;
}

/** Rotate v to the local reference frame where u is the 1st unit vector */
export function vec_to_local(u: Vec2, v: Vec2): Vec2 {
  return vec2(v.x * u.x + v.y * u.y, v.y * u.x - v.x * u.y);
}

/** Rotate v FROM the local reference frame where u is the 1st unit vector */
export function vec_to_global(u: Vec2, v: Vec2): Vec2 {
  return vec2(v.x * u.x - v.y * u.y, v.y * u.x + v.x * u.y);
}

export function vec_reflect(u: Vec2, v: Vec2): Vec2 {
  const a = u.y ** 2 - u.x ** 2;
  const b = -2 * u.x * u.y;
  return vec2(v.x * a + v.y * b, v.x * b - v.y * a);
}

export function vec_add(u: Vec2, v: Vec2): Vec2 {
  return { x: u.x + v.x, y: u.y + v.y };
}

export function vec_sub(u: Vec2, v: Vec2): Vec2 {
  return { x: u.x - v.x, y: u.y - v.y };
}

export function vec_fma(u: Vec2, s: number, v: Vec2): Vec2 {
  return { x: u.x + s * v.x, y: u.y + s * v.y };
}

export function vec_neg(u: Vec2): Vec2 {
  return { x: -u.x, y: -u.y };
}

export function vec_scale(a: number, v: Vec2): Vec2 {
  return { x: a * v.x, y: a * v.y };
}

export function vec_90(v: Vec2): Vec2 {
  return { x: v.y, y: -v.x };
}
