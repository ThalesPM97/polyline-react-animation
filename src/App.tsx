import React from 'react';
import AnimationLine from "./AnimationLine";
import './App.css';

type Point = [number, number];

function App() {
  const points : Point[] = [[100, 108], [150, 150], [300, 310], [600, 305], [620, 125]];

  return (
    <div className="App">
      <svg width="800" height="800">
        <AnimationLine
          points={points}
          animationTime={2}
          stroke="orange"
          fill="none"
          pulseAnimation
          pulseColor="blue"
          pulseRadius={30}
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          borderColor="black"
        />
      </svg>
    </div>
  );
}

export default App;
