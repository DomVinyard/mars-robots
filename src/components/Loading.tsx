import styled from 'styled-components';

function Loading() {
  return (
    <LoadingWrapper>
      <code>Ground control: establishing connection...</code>
    </LoadingWrapper>
  );
}

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  height: 100vh;
`;

export default Loading;
