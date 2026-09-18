import { useEffect, useState } from 'react';

type CounterProps = {
  end: number
  duration?: number
  className?: string
}

const Counter = ({ end, duration = 2000, className = '' }: CounterProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / Math.max(duration / 16, 1);

    const timer = window.setInterval(() => {
      start += increment

      if (start >= end) {
        setCount(end);
        window.clearInterval(timer);
        return;
      }

      setCount(Math.floor(start))
    }, 16)

    return () => window.clearInterval(timer);
  }, [end, duration]);

  return <span className={className}>{count}+</span>
}

export default Counter;
