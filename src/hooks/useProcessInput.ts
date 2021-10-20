import { useState, useEffect } from 'react';

function useProcessInput(input: any) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processed, setProcessed] = useState<any>(false) as any;
  useEffect(() => {
    async function doProcessing() {
      setIsProcessing(true);
      const url = `/.netlify/functions/process-input`;
      const response = await fetch(url, { method: 'POST', body: input });
      console.log({ response });
      const data = await response.json();
      setProcessed(data);
      setIsProcessing(false);
    }
    input && doProcessing();
  }, [input]);

  const reset = () => setProcessed(false);
  return { isProcessing, processed, reset };
}

export default useProcessInput;
