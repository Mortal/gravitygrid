import { useEffect, useState } from "react";
import "./App.css";
import { GameState, state_clone } from "./gamestate";
import { Vec2, vec2, vec_fma, vec_scale, vec_sub, vec_unit } from "./vec2";
import { constants } from "./constants";
import React from "react";
import { step } from "./step";

function App() {
  const defaultPos = vec2(
    constants.columns * constants.gridradius,
    (-constants.gridradius * 3.3) | 0,
  );
  const initialBoard = [
    1, -2, -2, -2, 1, 1, 1, -2, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1,
  ];
  const [state, setState] = useState<GameState>({
    points: 0,
    position: defaultPos,
    velocity: vec2(0, 0),
    values: initialBoard,
  });
  const topleft = vec2(0, -constants.gridradius * 4);
  const bottomright = vec2(
    constants.gridradius * 2 * constants.columns,
    constants.gridradius * 2 * constants.columns,
  );

  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const i = setInterval(() => stepone(), constants.framemsec);
    return () => clearInterval(i);
  }, [play]);
  const dead =
    state.position.y > bottomright.y + constants.ballradius ||
    state.position.x < topleft.x - constants.ballradius ||
    state.position.x > bottomright.x + constants.ballradius;
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
        <Circle position={state.position} radius={constants.ballradius} />
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
                  label={`${2 ** v}`}
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
        value={({ x, y }) =>
          vec2((x - topleft.x) * scale, (y - topleft.y) * scale)
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
  label,
}: {
  position: Vec2;
  radius: number;
  label?: string;
}) {
  const proj = React.useContext(SvgContext);
  const pos = proj(position, 1);
  const rad = proj(vec2(radius, radius), 0);
  return (
    <>
      <circle cx={pos.x} cy={pos.y} r={rad.x} fill="red" />
      {label && (
        <text x={pos.x} y={pos.y} dy={5} textAnchor="middle">
          {label}
        </text>
      )}
    </>
  );
}

export default App;
