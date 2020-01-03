import React from 'react';
import styled, { keyframes } from "styled-components";
import BezierEasing from "bezier-easing";

type Point = [number, number];

interface IPointInfo extends React.HTMLProps<SVGCircleElement> {
  point: Point,
  animation: boolean,
  length: number,
}

interface ILine {
  totalLength: number
  points: IPointInfo[]
}
interface IAnimationLineProps {
  points: Point[],
  animationTime: number;
  pulseAnimation: boolean;
  pulseTime?: number;
  pulseColor?: string;
  pulseRadius: number;
  fill?: any;
  opacity?: any;
  stroke?: any;
  strokeDashArray?: any;
  strokeLinecap?: any;
  strokeLinejoin?: any;
  strokeWidth?: any;
  transform?: any;
  borderColor?: string;
}

interface ILineProps {
  length?: number,
  animationTime?: number,
  fill?: any;
  opacity?: any;
  stroke?: any;
  strokeDashArray?: any;
  strokeLinecap?: any;
  strokeLinejoin?: any;
  strokeWidth?: any;
  transform?: any;
};

interface ICircleProps extends React.HTMLProps<SVGCircleElement> {
  delay?: number,
  pulseTime?: number
};

/** Line drawing animation*/
const dash = keyframes`
to {
  stroke-dashoffset: 0;
}
`;

/** Pulse animation*/
const pulse = (x: any, y: any) => keyframes`
0% {
 transform: scale(0);
 opacity: 0.8;
 transform-origin: ${x}px ${y}px;

}
100% {
  transform: scale(2);
  opacity: 0;
  transform-origin: ${x}px ${y}px;
 }
`;

/** SVG Polyline with animation*/
const Line = styled.polyline<ILineProps>`
  stroke-dasharray: ${props => props.length || "0"};
  stroke-dashoffset: ${props => props.length || "0"};
  animation: ${dash} ${props => props.animationTime || "0"}s ease forwards;
`;

/** SVG Circle with animation */
const Circle = styled.circle<ICircleProps>`
  opacity: 0;
  animation: ${props => pulse(props.cx, props.cy)}  ${props => props.pulseTime || "0.5"}s linear forwards;
  animation-delay: ${props => props.delay || "0"}s;
`;

//Map Bezier Curve for matching the time for the pulses animations
var easing = BezierEasing(0.25,0.1,0.25,1);
var easeCurveMap : { [progress: number]: number } = Array.from(Array(1001).keys()).reduce((acc, index) => {
  let time = 1-(index/1000);
  let progress = Math.round(easing(time) * 100) / 100
  return {
    [progress]: time,
    ...acc,
  }
}, {});

/** Distance between two points*/
const distanceBetweenPoints = (a: Point, b: Point) => {
  return Math.hypot(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]),2);
}

/** Check if this point is on the corner of the drawing or not*/
const isCurve = (a: Point, b: Point, c: Point) => {
  let triangleArea = (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[1] * (a[1] - b[1]))/2;

  let side1 = distanceBetweenPoints(a, b);
  let side2 = distanceBetweenPoints(a, c);
  let side3 = distanceBetweenPoints(c, b);
  let largestSide = Math.max(side1, side2, side3);
  let tol = (largestSide**2)/500;

  if(Math.abs(triangleArea) < tol){
    return false;
  }
  return true;
}

/** SVG Line with drawing animation and pulse animation.*/
const AnimationLine : React.FC<IAnimationLineProps> = (props) => {
  const { points, pulseAnimation } = props;
  const pointsString : string = points.reduce((acc, current) => `${acc} ${current[0]},${current[1]}`, "");

  const line : ILine = points.reduce((acc: ILine, e: Point, index: number) => {
    let extraLength = index === 0 ? 0 : distanceBetweenPoints(e, points[index-1]);
    let animation = (index === 0 || index === (points.length-1) || isCurve(points[index-1], e, points[index+1]));
    return {
      totalLength: acc.totalLength + extraLength,
      points: [
        ...acc.points,
        {
          length: acc.totalLength + extraLength,
          animation,
          point: e,
        }
      ]
    }
  }, { totalLength: 0, points: []});

  return (
    <g id="animationLine">
      {props.borderColor &&
        <Line //Border Line === Line with the same coordinates but thicker
          points={pointsString}
          length={line.totalLength}
          animationTime={props.animationTime}
          fill={props.fill}
          opacity={props.opacity}
          stroke={props.borderColor}
          strokeDasharray={props.strokeDashArray}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          strokeWidth={props.strokeWidth}
          transform={props.transform}
        />
      }
      <Line
        points={pointsString}
        length={line.totalLength}
        animationTime={props.animationTime}
        fill={props.fill}
        opacity={props.opacity}
        stroke={props.stroke}
        strokeDasharray={props.strokeDashArray}
        strokeLinecap={props.strokeLinecap}
        strokeLinejoin={props.strokeLinejoin}
        strokeWidth={props.borderColor? props.strokeWidth * 0.8: props.strokeWidth}
        transform={props.transform}
      />
      {/* Pulse animation for every curve*/}
      {pulseAnimation && line.points.map((e : IPointInfo) => {
        if(!e.animation) return <g/>;
        const progress : number = Math.round(e.length/line.totalLength * 100) / 100
        const delay : number = easeCurveMap[progress]*props.animationTime;
        return (
          <Circle
            key={`${e.point[0]}-${e.point[1]}`}
            fill={props.pulseColor || "blue"}
            r={props.pulseRadius || 25}
            cx={e.point[0]}
            cy={e.point[1]}
            pulseTime={props.pulseTime}
            delay={delay}>
          </Circle>
        );
      })}
    </g>
  );
}

export default AnimationLine;
