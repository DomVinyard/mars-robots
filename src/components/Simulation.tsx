import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DEFAULT_ZOOM_MS, MAX_GRID_PX } from '../config';

function Grid({ data }: any) {
  const [grid, setGrid] = useState(data.grid);

  const [currentRobot, setCurrentRobot] = useState<any[]>([]);
  const [currentRobotColor, setCurrentRobotColor] = useState<number>(0);

  // Automatically generate a grid based on the number of rows and columns
  // The size of the grid and the sprites will scale relative to the grid size
  const largestAxis = grid?.length > grid?.[0]?.length ? 'x' : 'y';
  const gridPxRatio = !grid?.length
    ? 1
    : largestAxis === 'y'
    ? grid?.[0]?.length / grid?.length
    : grid?.length / grid?.[0]?.length;
  const yAxisPx = largestAxis === 'y' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const xAxisPx = largestAxis === 'x' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const unitPx = xAxisPx / grid.length;

  // Give every robot a unique color
  const currentRobotPosition = currentRobot[currentRobot.length - 1];
  const robotColor = `hue-rotate(${currentRobotColor}deg)`;

  useEffect(() => {
    const runSimulation = async () => {
      for (let { color, locations } of data.robots) {
        for (let location of locations) {
          console.log({ location });
        }
      }
    };
    setTimeout(() => data ?? runSimulation(), DEFAULT_ZOOM_MS);
  }, [data]);

  return (
    <Outer>
      <Inner style={{ height: yAxisPx, width: xAxisPx, opacity: data ? 1 : 0 }}>
        {grid.map((column: any, i: number) => {
          return (
            <Column key={`col_${i}`} style={{ width: unitPx }}>
              {[...column].reverse().map((row: any) => {
                return (
                  <Row
                    key={`row_${row.x}_${row.y}`}
                    style={{
                      height: unitPx,
                      backgroundSize: unitPx * 0.5,
                      backgroundImage: row.scent ? 'url(/flag.png)' : 'none',
                    }}
                    className="row"
                  >
                    {currentRobotPosition && (
                      <div
                        style={{
                          opacity:
                            currentRobotPosition.x === row.x &&
                            currentRobotPosition.y === row.y
                              ? 1
                              : 0,
                        }}
                      >
                        {[0, 90, 180, 270].map((direction) => (
                          <div
                            key={direction}
                            style={{
                              overflow: 'hidden',
                              height:
                                currentRobotPosition.rotation === direction
                                  ? 'auto'
                                  : 0,
                              opacity:
                                currentRobotPosition.rotation === direction
                                  ? 1
                                  : 0,
                            }}
                          >
                            <img
                              alt="robot"
                              style={{
                                width: unitPx * 0.6,
                                filter: robotColor,
                              }}
                              src={`/robot-${currentRobotPosition.rotation}.png`}
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

export default Grid;
