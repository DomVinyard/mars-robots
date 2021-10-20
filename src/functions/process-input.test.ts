import LambdaTester from 'lambda-tester';
import { handler } from './process-input';

test('example from documentation', async () => {
  const input = `5 3\n1 1 E\nRFRFRFRF\n\n3 2 N\nFRRFLLFFRRFLL\n\n0 3 W\nLLFFFLFLFL`;
  const expected = `1 1 E\n3 3 N LOST\n2 3 S`;
  await LambdaTester(handler as any)
    .event({ body: input })
    .expectResolve((result: any) => {
      expect(result.statusCode).toEqual(200);
      const { output } = JSON.parse(result.body);
      expect(JSON.stringify(output)).toEqual(JSON.stringify(expected));
    });
});
