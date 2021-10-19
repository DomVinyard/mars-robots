import React, { useEffect } from 'react';
import styled from 'styled-components';
import useImage from 'react-use-image';

const testCaseInput = `5 3
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

const DEFAULT_DELAY_MS = 250;
const DEFAULT_ZOOM_MS = 2200;

function App() {
  const [input, setInput] = React.useState<string>();
  const [grid, setGrid] = React.useState<any>([]) as any;
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [robots, setRobots] = React.useState<any>([]) as any;
  const [currentRobot, setCurrentRobot] = React.useState<any[]>([]);
  const [currentRobotColor, setCurrentRobotColor] = React.useState<number>(0);
  const [output, setOutput] = React.useState<any[]>([]);
  const [delay] = React.useState(DEFAULT_DELAY_MS);
  const [textAreaValue, setTextAreaValue] = React.useState(testCaseInput);
  const [didZoomeOut, setDidZoomOut] = React.useState<boolean>(true);
  const { loaded } = useImage('/mars.png');

  // The first thing we need to do is parse the input to generate a grid and a list of robots
  useEffect(() => {
    if (!input || !loaded) return;
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
  }, [input, loaded]);

  // If the input is valid, we can start processing
  useEffect(() => {
    const processInstructions = async () => {
      setIsProcessing(true);
      type RotationTypes = { [key: string]: number };
      const rotationMap: RotationTypes = { N: 0, E: 90, S: 180, W: 270 };
      await setOutput([]);
      await setDidZoomOut(false);
      for (let { startAt, commands } of robots) {
        await setCurrentRobot([
          { x: +startAt[0], y: +startAt[1], rotation: rotationMap[startAt[2]] },
        ]);
        await setCurrentRobotColor(Math.floor(Math.random() * 360));
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
              // eslint-disable-next-line no-loop-func
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
        await setOutput((output) => [...output, finalRobotPosition]);
        await setCurrentRobot([]);
      }
      await setInput(undefined);
      setTimeout(async () => {
        await setDidZoomOut(true);
        await setIsProcessing(false);
      }, DEFAULT_ZOOM_MS + 1000);
    };
    setTimeout(() => {
      if (grid.length && robots.length && !isProcessing && input)
        processInstructions();
    }, DEFAULT_ZOOM_MS);
  }, [grid, robots, delay, setIsProcessing, isProcessing, input]);

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

  if (!loaded) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          height: '100vh',
        }}
      >
        <code>Ground control: establishing connection...</code>
      </div>
    );
  }

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
                        <img
                          alt="robot"
                          style={{
                            opacity:
                              currentRobotPosition?.x === row.x &&
                              currentRobotPosition?.y === row.y
                                ? 1
                                : 0,
                            width: unitPx * 0.66,
                            filter: `hue-rotate(${currentRobotColor}deg)`,
                          }}
                          src={`/robot-${currentRobotPosition?.rotation}.png`}
                        />
                      </Row>
                    );
                  })}
                </Column>
              );
            })}
          </Grid>
        </GridWrapper>
      </MarsWrapper>
      <ButtonsWrapper>
        <div>
          {output.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#fff' }}>
                {output.map(({ outputStr }) => (
                  <div>
                    <code>{outputStr}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!input && (
            <>
              <div>
                {!output.length && (
                  <textarea
                    style={{
                      opacity: 0.7,
                      marginTop: 28,
                      height: 200,
                      padding: 4,
                      borderRadius: 8,
                    }}
                    value={textAreaValue}
                    onChange={(e) => setTextAreaValue(e.target.value)}
                  />
                )}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  overflow: 'hidden',
                  maxHeight: didZoomeOut ? 100 : 0,
                  transition: 'all 0.5s ease-in-out',
                }}
              >
                <button
                  style={{ padding: '4px 8px' }}
                  onClick={async () => {
                    await setRobots([]);
                    await setGrid([]);
                    await setOutput([]);
                    !output?.length && (await setInput(textAreaValue));
                  }}
                >
                  🔌 {!output?.length ? 'Send' : 'New message'}
                </button>
              </div>
            </>
          )}
        </div>
      </ButtonsWrapper>
    </SpaceWrapper>
  );
}

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  z-index: 200;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
`;

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
  overflow: hidden;
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
