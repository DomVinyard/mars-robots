import React, { useEffect } from 'react';
import './App.css';

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

function App() {
  const [input, setInput] = React.useState(testCaseInput);
  const [grid, setGrid] = React.useState<any>([]) as any;
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [robots, setRobots] = React.useState<any>([]) as any;
  const [currentRobot, setCurrentRobot] = React.useState<any[]>([]);
  const [output, setOutput] = React.useState<any[]>([]);
  const [delay, setDelay] = React.useState(200);

  // The first thing we need to do is parse the input to generate a grid and a list of robots
  useEffect(() => {
    const [rawGridBounds, ...rawInstructions] = input
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
              grid[x][y].scent = true;
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
    };
    if (grid && robots.length && !isProcessing) processInstructions();
  }, [grid, robots]);

  const expectedOutput = `
  1 1 E
  3 3 N LOST 
  2 3 S
`;

  return (
    <div className="App">
      <header className="App-header">
        {output.map(({ outputStr }) => (
          <div>
            <code>{outputStr}</code>
          </div>
        ))}
        {currentRobot.map((line) => (
          <div>
            <code style={{ fontSize: '0.8rem' }}>
              {line.x} {line.y} {['↑', '→', '↓', '←'][line.rotation / 90]}
            </code>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
