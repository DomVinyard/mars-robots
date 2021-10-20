# Mars Robots

A coding challenge. I used React on the frontend and Serverless functions on the backend to process robot instructions.

As per the brief, the "Focus is on the front-end design and implementation".

## 📼 Code Walkthrough Video

This is the best place to start. I spend a a few minutes chatting about the code and my solution.

[Code Walkthrough (4:42)](https://www.loom.com/share/14eff73338ae49f6a9f6fefd801c7334)

(Note: The animation has a pretty poor framerate, try the demo below and it should be much smoother).

## 🕹 Demo

Play with the app yourself at [mars-robots.netlify.app](https://mars-robots.netlify.app).

## 👉 Quick Start Guide

```bash
yarn # install dependencies
npm install netlify-cli -g # install netlify dev
yarn dev # Start client and server
```

Then visit `http://localhost:8888`

## Codebase Tour

Some parts of the code worth checking out:

- The [conversion from input to output](https://github.com/DomVinyard/mars-robots/blob/master/src/functions/process-input.ts) happens in a Lambda function on the server. (Also see the [test suite](https://github.com/DomVinyard/mars-robots/blob/master/src/functions/process-input.test.ts) for that function).
- A [custom hook](https://github.com/DomVinyard/mars-robots/blob/master/src/hooks/useProcessInput.ts) for fetching the data.
- The [simulation](https://github.com/DomVinyard/mars-robots/blob/master/src/components/Simulation.tsx) that actually runs the animation.
- The [config file](https://github.com/DomVinyard/mars-robots/blob/master/src/config.ts) contains some constants that you can play around with to influence the animation.
- Finish up with [App.tsx](https://github.com/DomVinyard/mars-robots/blob/master/src/App.tsx) which orchestrates the Simulation and user controls.

These 5 files contain the majority of the complexity.

## Todo

I ended up spending a few hours on this, if I had a few extra hours I would prioritise the following:

- Better typing. Large parts of the codebase are untyped with extensive use of the `any` keyword, these should all be typed properly.
- Validation, if the input is not in the correct format the app will crash ungracefully.
- More tests, there are lots of edge cases to handle.
