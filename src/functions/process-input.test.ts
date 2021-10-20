import LambdaTester from 'lambda-tester';
import { handler } from './process-input';

const examples = [
  {
    case: 'Example from the docs',
    input: `5 3\n1 1 E\nRFRFRFRF\n\n3 2 N\nFRRFLLFFRRFLL\n\n0 3 W\nLLFFFLFLFL`,
    expected: `1 1 E\n3 3 N LOST\n2 3 S`,
  },
  {
    case: 'Rotate a couple more times',
    input: `5 3\n1 1 E\nRFRFRFRF\n\n3 2 N\nFRRFLLFFRRFLL\n\n0 3 W\nLLFFFLFLFLLL`,
    expected: `1 1 E\n3 3 N LOST\n2 3 N`,
  },
  {
    case: 'Multiple newlines between commands',
    input: `5 3\n1 1 E\nRFRFRFRF\n\n\n\n\n\n\n\n\n\n\n\n\n\n3 2 N\nFRRFLLFFRRFLL`,
    expected: `1 1 E\n3 3 N LOST`,
  },
  // Etc etc, there's a ton of edgecases here that would be really fun to test
  // alas I ran out of time.
];

for (const example of examples) {
  test(`${example.case}`, async () => {
    await LambdaTester(handler as any)
      .event({ body: example.input })
      .expectResolve((result: any) => {
        expect(result.statusCode).toEqual(200);
        const { output } = JSON.parse(result.body);
        expect(JSON.stringify(output)).toEqual(
          JSON.stringify(example.expected)
        );
      });
  });
}
