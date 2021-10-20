# Mars Robots

A coding challenge to process instructions for robots on Mars. It's written in TypeScript and uses React on the front end and Serverless functions on the back end.

As per the brief, the "focus is on the front-end design and implementation".

## 📼 Code Walkthrough Video

This is the best place to start. I spend a a few minutes chatting casually about the code and my solution.

👉👉👉 [Code Walkthrough (6:23)](https://www.loom.com/share/6188834f8b8d40e99c0f3721efd4f07f)

## 🕹 Demo

Play with the app yourself at [mars-robots.netlify.app](https://mars-robots.netlify.app).

## Codebase Tour

Some parts of the code worth checking out:

- The [conversion from input to output](https://github.com/DomVinyard/mars-robots/blob/master/src/functions/process-input.ts) happens in a Lambda function on the server. (Also see the [test suite](https://github.com/DomVinyard/mars-robots/blob/master/src/functions/process-input.test.ts) for that function).
- A [custom hook](https://github.com/DomVinyard/mars-robots/blob/master/src/hooks/useProcessInput.ts) for fetching the data.
- The [simulation](https://github.com/DomVinyard/mars-robots/blob/master/src/components/Simulation.tsx) that actually runs the animation.
- The [config file](https://github.com/DomVinyard/mars-robots/blob/master/src/config.ts) contains some constants that you can play around with to influence the animation.
- Finish up with [App.tsx](https://github.com/DomVinyard/mars-robots/blob/master/src/App.tsx) which orchestrates the Simulation and user controls.

These 5 files contain the majority of the complexity.

## ✨ Quick Start Guide

```bash
yarn # install dependencies
npm install netlify-cli -g # install netlify dev
yarn dev # Start client and server
```

Then visit `http://localhost:8888`

## Todo

I ended up spending a few hours on this, if I had a few extra hours I would prioritise the following:

1. Validation, if the input is not in the correct format the app will crash ungracefully.
2. Better typing. Large parts of the codebase are untyped with extensive use of the `any` keyword, these should all be typed properly.
3. More tests, there are lots of edge cases to handle.
