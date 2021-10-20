import React, { useEffect } from 'react';
import styled from 'styled-components';
import useImage from 'react-use-image';
import GithubCorner from 'react-github-corner';
import Loading from './components/Loading';
import ButtonsAndUI from './components/ButtonsAndUI';
import Grid from './components/Grid';
import { DEFAULT_ZOOM_MS, DEFAULT_DELAY_MS, GITHUB_URL } from './config';
import sleep from './utils/sleep';

function App() {
  const [input, setInput] = React.useState<string>();
  const [grid, setGrid] = React.useState<any>([]) as any;
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [robots, setRobots] = React.useState<any>([]) as any;
  const [currentRobot, setCurrentRobot] = React.useState<any[]>([]);
  const [currentRobotColor, setCurrentRobotColor] = React.useState<number>(0);
  const [output, setOutput] = React.useState<any[]>([]);
  const [delay] = React.useState(DEFAULT_DELAY_MS);
  const [didZoomOut, setDidZoomOut] = React.useState<boolean>(true);
  const { loaded } = useImage('/mars.png');

  // The first thing we need to do is parse the input to generate a grid and a list of robots
  // const { grid, robots } = useParseInput(input, [loaded])
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
          }
          await sleep(delay);
          const currentRobotPosition = { x, y, rotation };
          await setCurrentRobot((currentRobot) => [
            ...currentRobot,
            currentRobotPosition,
          ]);
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
        await setOutput((output) => [...output, finalRobotPosition]);
        await sleep(delay * 4);
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

  // Send the message to the robots
  const trigger = async (textAreaInput: string) => {
    await setRobots([]);
    await setGrid([]);
    await setOutput([]);
    !output?.length && (await setInput(textAreaInput));
  };

  if (!loaded) return <Loading />;
  return (
    <SpaceWrapper data-testid="app">
      <GithubCorner href={GITHUB_URL} bannerColor="#279BCC" />
      <MarsWrapper style={{ transform: `scale(${input ? 1 : 0.05})` }}>
        <Grid {...{ input, grid, robots, currentRobot, currentRobotColor }} />
      </MarsWrapper>
      <ButtonsAndUI {...{ input, output, didZoomOut }} onClick={trigger} />
    </SpaceWrapper>
  );
}

const SpaceWrapper = styled.div`
  background-color: #000;
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

export default App;
