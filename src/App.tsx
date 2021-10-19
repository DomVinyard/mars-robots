import React, { useEffect } from 'react';
// import './App.css';
import styled from 'styled-components';

const testCaseInput = `
  5 3
  1 1 E 
  RFRFRFRF

  3 2 N 
  FRRFLLFFRRFLL

  0 3 W 
  LLFFFLFLFL
`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_DELAY_MS = 150;
const DEFAULT_ZOOM_MS = 2200;

function App() {
  const [input, setInput] = React.useState<string>();
  const [grid, setGrid] = React.useState<any>([]) as any;
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [robots, setRobots] = React.useState<any>([]) as any;
  const [currentRobot, setCurrentRobot] = React.useState<any[]>([]);
  const [currentRobotColor, setCurrentRobotColor] = React.useState<number>(0);
  const [output, setOutput] = React.useState<any[]>([]);
  const [delay, setDelay] = React.useState(DEFAULT_DELAY_MS);

  // The first thing we need to do is parse the input to generate a grid and a list of robots
  useEffect(() => {
    if (!input) return;
    const [rawGridBounds, ...rawInstructions] = `${input}`
      .split('\n')
      .filter(Boolean)
      .map((s) => s.trim());
    const [gridBoundsXRaw, gridBoundsYRaw] = rawGridBounds.split(/\s{1,}/);
    const gridBoundsX = +gridBoundsXRaw;
    const gridBoundsY = +gridBoundsYRaw;
    setGrid(
      [...Array(gridBoundsX + 1)].map((_, x) =>
        [...Array(gridBoundsY + 1)].map((_, y) => ({
          x: x,
          y: y,
          scent: false,
        }))
      )
    );
    setRobots(
      rawInstructions.reduce((acc: any, item: any, i: number) => {
        if (i % 2 === 0) {
          return [...acc, { startAt: item.split(/\s{1,}/) }];
        } else {
          const thisCommand = acc.pop();
          return [...acc, { ...thisCommand, commands: item.split('') }];
        }
      }, [])
    );
  }, [input]);

  // If the input is valid, we can start processing
  useEffect(() => {
    const processInstructions = async () => {
      setIsProcessing(true);
      type RotationTypes = { [key: string]: number };
      const rotationMap: RotationTypes = { N: 0, E: 90, S: 180, W: 270 };
      await setOutput([]);
      console.log(robots);
      console.log('START');
      for (let { startAt, commands } of robots) {
        await setCurrentRobot([]);
        await setCurrentRobotColor(Math.floor(Math.random() * 360));
        console.log({ startAt });
        const [xStr, yStr, r] = startAt as any;
        let x = +xStr;
        let y = +yStr;
        let rotation = rotationMap[r];
        let wasLost = false;
        for (let command of commands) {
          const hasScent = grid[x][y]?.scent;
          if (command === 'L') rotation -= 90;
          if (command === 'R') rotation += 90;
          if (rotation < 0) rotation += 360;
          if (rotation >= 360) rotation -= 360;
          if (command === 'F') {
            let targetX = x;
            let targetY = y;
            if (rotation === 0) targetY += 1;
            if (rotation === 180) targetY -= 1;
            if (rotation === 90) targetX += 1;
            if (rotation === 270) targetX -= 1;
            const willFail =
              targetX < 0 ||
              targetX > grid.length - 1 ||
              targetY < 0 ||
              targetY > grid[0].length - 1;
            if (willFail) {
              if (hasScent) continue;
              wasLost = true;
              console.log('LOST');
              await setGrid((grid: any) => {
                const tempGrid = [...grid];
                tempGrid[x][y].scent = true;
                return tempGrid;
              });
              break;
            }
            x = targetX;
            y = targetY;
            await sleep(delay);
            const currentRobotPosition = { x, y, rotation };
            await setCurrentRobot((currentRobot) => [
              ...currentRobot,
              currentRobotPosition,
            ]);
          }
          console.log({ command, x, y, rotation });
        }
        const finalRotation = Object.keys(rotationMap).find(
          (key) => rotationMap[key] === rotation
        );
        const robotFinalString = `${x} ${y} ${finalRotation}${
          wasLost ? ' LOST' : ''
        }`;
        const finalRobotPosition = {
          x,
          y,
          rotation: finalRotation,
          wasLost,
          outputStr: robotFinalString,
        };
        await sleep(delay);
        console.log(finalRobotPosition);
        await setOutput((output) => [...output, finalRobotPosition]);
        await setCurrentRobot([]);
      }
      await setInput(undefined);
      setIsProcessing(false);
      // await setGrid([]);
      // await setRobots([]);
    };
    if (grid && robots.length && !isProcessing)
      setTimeout(() => processInstructions(), DEFAULT_ZOOM_MS);
  }, [grid, robots]);

  //   const expectedOutput = `
  //   1 1 E
  //   3 3 N LOST
  //   2 3 S
  // `;

  // if (!grid.length) return <div>Loading...</div>;

  const MAX_GRID_PX = 400;
  const largestAxis = grid.length > grid?.[0]?.length ? 'x' : 'y';
  const gridPxRatio =
    largestAxis === 'y'
      ? grid?.[0]?.length / grid?.length
      : grid?.length / grid?.[0]?.length;
  const yAxisPx = largestAxis === 'y' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const xAxisPx = largestAxis === 'x' ? MAX_GRID_PX : MAX_GRID_PX / gridPxRatio;
  const unitPx = xAxisPx / grid.length;

  const currentRobotPosition = currentRobot[currentRobot.length - 1];

  return (
    <SpaceWrapper>
      <MarsWrapper
        style={{
          transform: `scale(${input ? 1 : 0.05})`,
        }}
      >
        <GridWrapper>
          <Grid
            style={{ height: yAxisPx, width: xAxisPx, opacity: input ? 1 : 0 }}
          >
            {grid.map((column: any) => {
              return (
                <Column style={{ width: unitPx }}>
                  {[...column].reverse().map((row: any) => {
                    return (
                      <Row
                        style={{
                          height: unitPx,
                          backgroundSize: unitPx * 0.5,
                          backgroundImage: row.scent
                            ? 'url(/flag.png)'
                            : 'none',
                        }}
                        className="row"
                      >
                        {currentRobotPosition?.x === row.x &&
                          currentRobotPosition?.y === row.y && (
                            <img
                              alt="robot"
                              style={{
                                width: unitPx * 0.66,
                                filter: `hue-rotate(${currentRobotColor}deg)`,
                              }}
                              src={`/robot-${currentRobotPosition.rotation}.png`}
                            />
                          )}
                      </Row>
                    );
                  })}
                </Column>
              );
            })}
          </Grid>
        </GridWrapper>
      </MarsWrapper>
      <button
        onClick={async () => {
          await setRobots([]);
          await setGrid([]);
          await setOutput([]);
          await setInput(testCaseInput);
        }}
      >
        Input
      </button>
      {output.length && (
        <div style={{ color: '#fff' }}>
          {output.map(({ outputStr }) => (
            <div>
              <code>{outputStr}</code>
            </div>
          ))}
        </div>
      )}
    </SpaceWrapper>
  );
}

const GridWrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Grid = styled.div`
  background-color: #ce8850;
  transition: all ${DEFAULT_ZOOM_MS / 1000}s ease;
`;

const Column = styled.div`
  float: left;
  width: 20px; /* 5 columns: 100% ÷ 5 = 20% */
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

const MarsWrapper = styled.div`
  background-image: url('/mars.png');
  background-position: center;
  transition: all ${DEFAULT_ZOOM_MS / 1000}s ease-in-out;
  background-size: contain;
  background-repeat: no-repeat;
  width: 6000px;
  height: 6000px;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-left: -3000px;
  margin-top: -3000px;
`;

const SpaceWrapper = styled.div`
  background-color: #000;
`;

const Row = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-repeat: no-repeat;
  &:nth-child(even) {
    background-color: #ce8850;
  }
`;

export default App;
