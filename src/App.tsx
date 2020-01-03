import React from 'react';
import AnimationLine from "./AnimationLine.tsx";
import './App.css';


function App() {
  const points = [[100, 108], [150, 150], [300, 310], [625, 300], [600, 305], [620, 125]];

  return (
    <div className="App">
      <svg width="800" height="800">
        <AnimationLine
          points={points}
          animationTime={2}
          stroke="black"
          fill="none"
          pulseAnimation
          pulseColor="blue"
          pulseRadius={10}
        />
      </svg>
    </div>
  );
}

export default App;
