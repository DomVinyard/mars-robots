import React, { useState } from 'react';
import styled from 'styled-components';

const exampleInput = `5 3
1 1 E 
RFRFRFRF

3 2 N 
FRRFLLFFRRFLL

0 3 W 
LLFFFLFLFL
`;

function ButtonsAndUI({ input, output, zoom, onClick }: any) {
  const [textAreaValue, setTextAreaValue] = useState(exampleInput);
  return (
    <Wrapper>
      <div>
        {output?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#fff' }}>
              {output?.map?.((line: any, i: number) => (
                <div key={i}>
                  <code>{line}</code>
                </div>
              ))}
            </div>
          </div>
        )}
        <>
          {!input && (
            <div>
              {!output?.length && (
                <TextArea
                  value={textAreaValue}
                  onChange={(e) => setTextAreaValue(e.target.value)}
                />
              )}
            </div>
          )}
          {zoom !== 'in' && (
            <Buttons style={{ maxHeight: zoom === 'out' ? 100 : 0 }}>
              <Button onClick={() => onClick(textAreaValue)}>
                🔌 {!output?.length ? 'Send' : 'Reconnect'}
              </Button>
            </Buttons>
          )}
        </>
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
