import { GameState } from "./gamestate";
import { Vec2, vec2, vec_fma, vec_scale, vec_sub } from "./vec2";
import { Constants, constants, walls } from "./constants";
import React from "react";
import styles from "./App.module.css";

export function Svg({
  constants,
  scale,
  onClick,
  children,
}: {
  constants: Constants;
  scale: number;
  onClick?: (position: Vec2, ev: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  const topleft = vec2(-constants.margin - 2, -constants.gridradius * 5);
  const bottomright = vec2(
    constants.gridradius * 2 * constants.columns + constants.margin + 2,
    constants.gridradius * 2 * constants.columns,
  );
  const pixelsize = vec_scale(scale, vec_sub(bottomright, topleft));
  return (
    <svg
      width={pixelsize.x}
      height={pixelsize.y}
      onClick={(e) => {
        if (onClick == null) return;
        const target = e.currentTarget;
        if (!(target instanceof SVGSVGElement)) return;
        const { left, top } = target.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        onClick(vec_fma(topleft, 1 / scale, vec2(x, y)), e);
      }}
    >
      <SvgContext.Provider
        value={({ x, y }, a) =>
          vec2((x - topleft.x * a) * scale, (y - topleft.y * a) * scale)
        }
      >
        {children}
      </SvgContext.Provider>
    </svg>
  );
}

export const SvgContext = React.createContext<
  (v: Vec2, affine: number) => Vec2
>((x) => x);

export function Board({
  state,
  constants,
}: {
  state: GameState;
  constants: Constants;
}) {
  return (
    <>
      <Circle
        position={state.position}
        radius={constants.ballradius}
        logvalue={-1}
      />
      {state.values.flatMap((v, i) =>
        v >= 0
          ? [
              <Circle
                key={i}
                position={vec2(
                  ((i % constants.columns) * 2 + 1) * constants.gridradius,
                  (((i / constants.columns) | 0) * 2 + 1) *
                    constants.gridradius,
                )}
                radius={constants.targetradius}
                logvalue={v}
              />,
            ]
          : [],
      )}
    </>
  );
}

function Circle({
  position,
  radius,
  logvalue,
}: {
  position: Vec2;
  radius: number;
  logvalue: number;
}) {
  const proj = React.useContext(SvgContext);
  const pos = proj(position, 1);
  const rad = proj(vec2(radius, radius), 0);
  return (
    <>
      <circle
        cx={pos.x}
        cy={pos.y}
        r={rad.x}
        className={styles.circle}
        data-logvalue={logvalue}
        style={{ ["--hue"]: `${logvalue * 23}` } as any}
      />
      {logvalue >= 0 && (
        <text x={pos.x} y={pos.y} dy={5} textAnchor="middle">
          {2 ** logvalue}
        </text>
      )}
    </>
  );
}

function Walls() {
  const w = walls(constants);
  const proj = React.useContext(SvgContext);
  const tl = proj(vec2(w.left, w.top), 1);
  const br = proj(vec2(w.right, w.bottom), 1);
  return (
    <path
      d={`M ${tl.x} ${tl.y} V ${br.y} H ${br.x} V ${tl.y} Z`}
      style={{ fill: "#574539" }}
    />
  );
}
