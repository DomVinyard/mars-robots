import { useState } from 'react';
import styled from 'styled-components';
import useImage from 'react-use-image';
import GithubCorner from 'react-github-corner';
import Loading from './components/Loading';
import ButtonsAndUI from './components/ButtonsAndUI';
import Simulation from './components/Simulation';
import { DEFAULT_ZOOM_MS, GITHUB_URL } from './config';
import useProcessInput from './hooks/useProcessInput';

function App() {
  // When the input is set, parse it and return the grid and robot list
  const [input, setInput] = useState<string>();
  const { isProcessing, processed, reset } = useProcessInput(input) as any;
  const [zoom, setZoom] = useState<string>('out');

  // The markup is just the simulation and the UI/Buttons
  return (
    <SpaceWrapper data-testid={`${isProcessing ? 'is' : 'not'}-processing`}>
      <GithubCorner href={GITHUB_URL} bannerColor="#279BCC" />
      <MarsWrapper style={{ transform: `scale(${input ? 1 : 0.05})` }}>
        {processed && (
          <Simulation
            data={processed}
            onStart={() => setZoom('in')}
            onEnd={() => setZoom('out')}
          />
        )}
      </MarsWrapper>
      <ButtonsAndUI
        input={input}
        output={processed.output}
        zoom={zoom}
        onClick={async (commands: string) =>
          processed ? reset() : await setInput(commands)
        }
      />
    </SpaceWrapper>
  );
}

// Preload the mars image, it's big
const AppLoading = () => {
  const { loaded } = useImage('/mars.png');
  if (!loaded) return <Loading />;
  return <App />;
};

// Space is black
const SpaceWrapper = styled.div`
  background-color: #000;
`;

// Mars is red
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

export default AppLoading;
