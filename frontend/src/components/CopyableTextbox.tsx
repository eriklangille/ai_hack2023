import React, { useState, useRef } from 'react';

interface Props {
  text: string;
}

const CopyableTextBox: React.FC<Props> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
    }
  };

  return (
    <div className='relative w-full text-left px-1.5'>
      <input type='text' className='w-full p-1 rounded bg-slate-100 text-zinc-900' value={text} readOnly ref={inputRef} />
      <span className='absolute right-2.5 top-1'>
        <button className='text-slate-400' onClick={handleCopy}>
          {copied ? 'Copied!' : <span>Copy</span>}
        </button>
      </span>
    </div>
  );
};

export default CopyableTextBox;