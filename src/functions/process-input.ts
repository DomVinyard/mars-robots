import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  // update
  try {
    const output: any = [];
    return {
      statusCode: 200,
      body: JSON.stringify({ output }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error }),
    };
  }
};

export { handler };

//   const expectedOutput = `
//   1 1 E
//   3 3 N LOST
//   2 3 S
// `;

// const testCaseInput = `5 3
// 1 1 E
// RFRFRFRF

// 3 2 N
// FRRFLLFFRRFLL

// 0 3 W
// LLFFFLFLFL
// `;
