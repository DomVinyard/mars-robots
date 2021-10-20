import { Handler } from '@netlify/functions';
import { rotationMap } from '../utils';

const handler: Handler = async (event) => {
  try {
    const input = event?.body as string;
    if (!input) throw new Error('No input provided');

    // Determine the grid size
    const [rawGridBounds, ...rawInstructions] = `${input}`
      .split('\n')
      .filter(Boolean)
      .map((s) => s.trim());
    const [gridBoundsXRaw, gridBoundsYRaw] = rawGridBounds.split(/\s{1,}/);
    const gridBoundsX = +gridBoundsXRaw;
    const gridBoundsY = +gridBoundsYRaw;
    let grid = [...Array(gridBoundsX + 1)].map(
      (_, x) =>
        [...Array(gridBoundsY + 1)].map((_, y) => ({
          x: x,
          y: y,
          scent: false,
        })) as any
    );

    // Split the input into distinct robots
    let processedInstructions = rawInstructions.reduce(
      (acc: any, item: any, i: number) => {
        if (i % 2 === 0) {
          return [...acc, { startAt: item.split(/\s{1,}/) }];
        } else {
          const thisCommand = acc.pop();
          return [...acc, { ...thisCommand, commands: item.split('') }];
        }
      },
      []
    );
    let robots = [];
    let iteration = 0;
    // Calculate steps
    for (let { startAt, commands } of processedInstructions) {
      let robot = {
        color: `hue-rotate(${Math.floor(Math.random() * 360)}deg)`,
        locations: [
          { x: +startAt[0], y: +startAt[1], rotation: rotationMap[startAt[2]] },
        ],
      } as any;
      const [xStr, yStr, r] = startAt as any;
      let x = +xStr;
      let y = +yStr;
      let rotation = rotationMap[r];
      let wasLost = false;
      for (let command of commands) {
        iteration++;
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
            grid[x][y].scent = iteration;
            break;
          }
          x = targetX;
          y = targetY;
        }
        const currentRobotPosition = { x, y, rotation, lost: true };
        robot.locations = [...robot.locations, currentRobotPosition];
      }
      const endRotation = Object.keys(rotationMap).find(
        (key) => rotationMap[key] === rotation
      );
      const robotOutput = `${x} ${y} ${endRotation}${wasLost ? ' LOST' : ''}`;
      robots.push({ ...robot, lost: wasLost, output: robotOutput });
    }

    // Collect all outputs and return
    let output = robots.map((robot) => robot.output).join('\n');
    const body = JSON.stringify({ grid, robots, output });
    return { statusCode: 200, body };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export { handler };
