import { useEffect, useState } from "react";
// import CopyableTextBox from "./CopyableTextbox";

type ChartProps = {
  title: string;
  index: number;
  javascript?: string;
  prompt?: string;
}

const ChartFrame = ({title, index, javascript, prompt}: ChartProps) => {
  const [chartInUse, setChartInUse] = useState<boolean>(false);

  useEffect(() => {
    if (javascript && !chartInUse) {
      setChartInUse(true);
      try {
        const fn = new Function(javascript);
        fn();
      } catch {
        console.log('error', javascript)
      }
    }
  }, [javascript, chartInUse])

  return (
    <div className='bg-slate-50 min-w-80 w-fit min-h-80 rounded drop-shadow p-2'>
      {/* <p>{'inuse: ' + chartInUse}</p> */}
      <h1 className='ml-1.5 text-left font-bold text-ellipsis'>{title}</h1>
      <div className={`w-[35rem] h-60 rounded ${ chartInUse ? 'bg-slate-50': 'animate-pulse bg-slate-200'} m-1.5`}>
        <canvas id={`chart${index}`}></canvas>
      </div>
      {/* {prompt && (
        <CopyableTextBox
          text={prompt}
        />
      )} */}
    </div>
  );
}

export default ChartFrame;