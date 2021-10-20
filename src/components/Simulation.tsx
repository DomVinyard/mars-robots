import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DEFAULT_ZOOM_MS, MAX_GRID_PX, DEFAULT_DELAY_MS } from '../config';
import { sleep } from '../utils';

function Simulation({ data, setOutput, onEnd, zoom }: any) {
  const [currentRobot, setCurrentRobot] = useState<any[]>([]) as any;
  const [currentLocation, setCurrentLocation] = useState<any[]>([]) as any;
  const [iteration, setIteration] = useState(0);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Automatically generate a grid based on the number of rows and columns
  // The size of the grid and the sprites will scale relative to the grid size
  const x = data.grid.length;
  const y = data.grid[0].length;
  const largestAxis = x > y ? 'x' : 'y';
  const gridPxRatio = largestAxis === 'y' ? y / x : x / y;
  const yAxisPx = largestAxis === 'y' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const xAxisPx = largestAxis === 'x' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const unitPx = xAxisPx / x;

  useEffect(() => {
    const runSimulation = async () => {
      for (let robot of data.robots) {
        await setCurrentRobot(robot);
        for (let location of robot.locations) {
          setCurrentLocation(location);
          await sleep(DEFAULT_DELAY_MS);
          await setIteration((iteration) => iteration + 1);
        }
        setOutput((output: any[]) => [...output, robot.output]);
        await sleep(DEFAULT_DELAY_MS * 3);
      }
      onEnd();
    };
    if (simulating || zoom === 'out') return;
    setTimeout(runSimulation, DEFAULT_ZOOM_MS);
    setSimulating(true);
  }, [data.robots, onEnd, setOutput, simulating, zoom]);

  return (
    <Outer>
      <Inner style={{ height: yAxisPx, width: xAxisPx, opacity: data ? 1 : 0 }}>
        {data.grid.map((column: any, col_i: number) => {
          return (
            <Column key={`col_${col_i}`} style={{ width: unitPx }}>
              {[...column].reverse().map((row: any, row_i: number) => {
                const hasFlag = row.scent && row.scent <= iteration;
                const { x, y, rotation } = currentLocation || {};
                return (
                  <Row
                    key={`row_${row.x}_${row.y}`}
                    style={{
                      height: unitPx,
                      backgroundSize: unitPx * 0.5,
                      backgroundImage: hasFlag ? 'url(/flag.png)' : 'none',
                    }}
                    className="row"
                  >
                    {currentLocation && (
                      <div
                        style={{ opacity: x === row.x && y === row.y ? 1 : 0 }}
                      >
                        {[0, 90, 180, 270].map((direction) => (
                          <div
                            key={direction}
                            style={{
                              overflow: 'hidden',
                              height: rotation === direction ? 'auto' : 0,
                              opacity: rotation === direction ? 1 : 0,
                            }}
                          >
                            <img
                              alt="robot"
                              style={{
                                width: unitPx * 0.6,
                                filter: currentRobot?.color,
                              }}
                              src={`/robot-${rotation}.png`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Row>
                );
              })}
            </Column>
          );
        })}
      </Inner>
    </Outer>
  );
}

const Outer = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Inner = styled.div`
  background-color: #ce8950d3;
  transition: all ${DEFAULT_ZOOM_MS / 1000}s ease;
  overflow: hidden;
`;

const Column = styled.div`
  float: left;
  height: 100%;
  top: 0;
  bottom: 0;
  overflow: hidden;
  &:nth-child(odd) {
    background-color: #b57044;
  }
  &:nth-child(even) .row:nth-child(even) {
    background-color: #b57044;
  }
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-repeat: no-repeat;
  &:nth-child(even) {
    background-color: #ce8950d3;
  }
`;

export default Simulation;
