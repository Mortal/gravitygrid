import { useState, useEffect } from "react";
import { defaultPos, constants } from "./constants";
import { GameState, state_clone } from "./gamestate";
import { step } from "./step";
import { vec2, vec_scale, vec_unit, vec_sub } from "./vec2";
import { Board, Svg } from "./Svg";

export function App1() {
  const initialBoard = [
    1, -2, 2, -2, 1, 1, 1, -2, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1,
  ];
  const [state, setState] = useState<GameState>({
    points: 0,
    position: defaultPos(constants),
    velocity: vec2(0, 0),
    values: initialBoard,
  });

  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const i = setInterval(() => stepone(), constants.framemsec);
    return () => clearInterval(i);
  }, [play]);
  const dead =
    state.position.y >
    constants.gridradius * 2 * constants.columns + constants.ballradius;
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
        constants={constants}
        scale={0.5}
        onClick={(p) => {
          setState({
            position: defaultPos(constants),
            velocity: vec_scale(
              constants.speed,
              vec_unit(vec_sub(p, defaultPos(constants))),
            ),
            points: 0,
            values: initialBoard,
          });
          setPlay(true);
        }}
      >
        <Board state={state} constants={constants} />
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
