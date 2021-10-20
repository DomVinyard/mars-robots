import React, { useState } from 'react';
import styled from 'styled-components';

const testCaseInput = `5 3
1 1 E 
RFRFRFRF

3 2 N 
FRRFLLFFRRFLL

0 3 W 
LLFFFLFLFL
`;

function ButtonsAndUI({ input, output, didZoomOut, onClick }: any) {
  const [textAreaValue, setTextAreaValue] = useState(testCaseInput);
  return (
    <Wrapper>
      <div>
        {output?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#fff' }}>
              {output.map(({ outputStr, i }: any) => (
                <div key={i}>
                  <code>{outputStr}</code>
                </div>
              ))}
            </div>
          </div>
        )}
        {!input && (
          <>
            <div>
              {!output?.length && (
                <TextArea
                  value={textAreaValue}
                  onChange={(e) => setTextAreaValue(e.target.value)}
                />
              )}
            </div>
            <Buttons style={{ maxHeight: didZoomOut ? 100 : 0 }}>
              <Button onClick={() => onClick(textAreaValue)}>
                🔌 {!output?.length ? 'Send' : 'Reconnect'}
              </Button>
            </Buttons>
          </>
        )}
      </div>
    </Wrapper>
  );
}

const Button = styled.button`
  padding: 4px 8px;
`;

const TextArea = styled.textarea`
  opacity: 0.7;
  margin-top: 28px;
  height: 200px;
  padding: 4px;
  border-radius: 8px;
`;

const Buttons = styled.div`
  text-align: center;
  overflow: hidden;
  transition: all 0.5s ease-in-out;
`;

const Wrapper = styled.div`
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

export default ButtonsAndUI;
