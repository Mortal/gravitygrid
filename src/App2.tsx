import React from "react";
import "./App.css";
import { Board, Svg, SvgContext } from "./Svg";
import {
  Constants,
  constants as defaultConstants,
  defaultPos,
} from "./constants";
import { GameState } from "./gamestate";
import { vec2, vec_scale, vec_sub, vec_unit } from "./vec2";
import { step } from "./step";

export function App2() {
  const [initialBoard, setInitialBoard] = React.useState([
    1, 1, -2, 1, 1, 1, 1, 1, 1, 1, -2, 1, -1, -1, -2, -1, -1, -1, -1, -1, 1, -1,
    -2, -1, -1,
  ]);
  const defaultAim = vec2(280.5, 187);
  const [initialAim, setInitialAim] = React.useState(defaultAim);
  const [constants, setConstants] = React.useState(defaultConstants);
  const firstFrame = 9;
  const lastFrame = 60;
  const states = React.useMemo(() => {
    const initialVel = vec_scale(
      constants.speed,
      vec_unit(vec_sub(initialAim, defaultPos(constants))),
    );
    const states: GameState[] = [];
    const state: GameState = {
      points: 0,
      position: defaultPos(constants),
      values: [...initialBoard],
      velocity: { ...initialVel },
    };
    for (let i = firstFrame; i <= lastFrame; ++i) {
      states.push({
        points: state.points,
        position: { ...state.position },
        values: [...state.values],
        velocity: { ...state.velocity },
      });
      for (let j = 0; j < constants.stepsPerFrame; ++j)
        step(state, constants.dt, constants);
    }
    return states;
  }, [initialBoard, initialAim]);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TextInput
        value={`${initialAim.x},${initialAim.y}`}
        onChange={(s) => {
          const [x, y] = s.split(",").map((s) => +s);
          if (!Number.isNaN(x * y)) setInitialAim({ x, y });
        }}
      />
      <MultiTextInput value={constants} onChange={(c) => setConstants(c)} />
      <div style={{ display: "flex", flexDirection: "row", flex: "1 0 0" }}>
        <Svg
          constants={constants}
          scale={0.5}
          onClick={(p, ev) => {
            if (ev.shiftKey) {
              ev.preventDefault();
              setInitialAim(p);
              return;
            }
            const x = (p.x / (2 * constants.gridradius)) | 0;
            const y = (p.y / (2 * constants.gridradius)) | 0;
            if (
              0 <= x &&
              x < constants.columns &&
              0 <= y &&
              y < constants.rows
            ) {
              ev.preventDefault();
              const index = y * constants.columns + x;
              const v = ev.ctrlKey ? -1 : 1;
              setInitialBoard([
                ...initialBoard.slice(0, index),
                (initialBoard[index] || 0) + v,
                ...initialBoard.slice(index + 1),
              ]);
            }
          }}
        >
          <Board state={states[0]} constants={constants} />
        </Svg>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            flex: "1 0 0",
          }}
        >
          {states.map((s, i) => (
            <Svg key={i} constants={constants} scale={0.2}>
              <Board state={s} constants={constants} />
              <Img frame={i + firstFrame} constants={constants} />
            </Svg>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

function cast<T>(like: T, value: string): T {
  if (typeof like === "number") return +value as any;
  return value as any;
}

function MultiTextInput<K extends { [s: string]: unknown }>({
  value,
  onChange,
}: {
  value: K;
  onChange: (s: K) => void;
}) {
  return Object.entries(value).map(([k, v]) => (
    <TextInput
      key={k}
      value={`${v}`}
      onChange={(s) => onChange({ ...value, [k]: cast(v, s) })}
    />
  ));
}

function Img({ frame, constants }: { frame: number; constants: Constants }) {
  const proj = React.useContext(SvgContext);
  const [img, setImg] = React.useState<string>();
  React.useEffect(() => {
    import(`/nubby/frame${`${1000 + frame}`.slice(1)}.png`).then((s) =>
      setImg(s.default),
    );
  }, []);
  const imgcrop = proj(vec2(-673, -493), 0);
  const imgboardsize = proj(vec2(1920, 1080), 0);
  const boardpos = proj(vec2(0, 0), 1);
  const boardsize = proj(
    vec2(
      constants.gridradius * 2 * constants.columns,
      constants.gridradius * 2 * constants.rows,
    ),
    1,
  );

  return (
    <foreignObject width={boardsize.x} height={boardsize.y}>
      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <img
          src={img}
          style={{
            opacity: 0.5,
            position: "absolute",
            zIndex: 1,
            width: imgboardsize.x,
            height: imgboardsize.y,
            left: imgcrop.x + boardpos.x,
            top: imgcrop.y + boardpos.y,
          }}
        />
      </div>
    </foreignObject>
  );
}
