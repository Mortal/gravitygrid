import { useEffect, useState } from "react";
import "./App.css";
import { GameState, state_clone } from "./gamestate";
import { Vec2, vec2, vec_fma, vec_scale, vec_sub, vec_unit } from "./vec2";
import { constants, walls } from "./constants";
import React from "react";
import { step } from "./step";
import styles from "./App.module.css";

function App() {
  const defaultPos = vec2(
    constants.columns * constants.gridradius,
    constants.starty,
  );
  const initialBoard = [
    1, -2, 2, -2, 1, 1, 1, -2, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1,
  ];
  const [state, setState] = useState<GameState>({
    points: 0,
    position: defaultPos,
    velocity: vec2(0, 0),
    values: initialBoard,
  });
  const topleft = vec2(-constants.margin - 2, -constants.gridradius * 5);
  const bottomright = vec2(
    constants.gridradius * 2 * constants.columns + constants.margin + 2,
    constants.gridradius * 2 * constants.columns,
  );

  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const i = setInterval(() => stepone(), constants.framemsec);
    return () => clearInterval(i);
  }, [play]);
  const dead = state.position.y > bottomright.y + constants.ballradius;
  useEffect(() => {
    if (play && dead) setPlay(false);
  }, [play && dead]);

  const stepone = () =>
    setState((state) => {
      const s = state_clone(state);
      for (let i = 0; i < constants.stepsPerFrame; ++i)
        step(s, constants.dt, constants);
      return s;
    });
  return (
    <>
      <Svg
        topleft={topleft}
        bottomright={bottomright}
        scale={0.5}
        onClick={(p) => {
          setState({
            position: defaultPos,
            velocity: vec_scale(
              constants.speed,
              vec_unit(vec_sub(p, defaultPos)),
            ),
            points: 0,
            values: initialBoard,
          });
          setPlay(true);
        }}
      >
        <Walls />
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
      </Svg>
      <div className="card">
        <button onClick={() => stepone()}>{state.points}</button>
        <button onClick={() => setPlay((p) => !p)}>
          {play ? "Pause" : "Play"}
        </button>
      </div>
    </>
  );
}

const SvgContext = React.createContext<(v: Vec2, affine: number) => Vec2>(
  (x) => x,
);

function Svg({
  topleft,
  bottomright,
  scale,
  onClick,
  children,
}: {
  topleft: Vec2;
  bottomright: Vec2;
  scale: number;
  onClick: (position: Vec2, ev: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  const pixelsize = vec_scale(scale, vec_sub(bottomright, topleft));
  return (
    <svg
      width={pixelsize.x}
      height={pixelsize.y}
      onClick={(e) => {
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

export default App;
