import * as React from "react";
import { SVGProps } from "react";

const Preview = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g strokeWidth={0} />
    <g strokeLinecap="round" strokeLinejoin="round" />
    <path fill="#fff" fillOpacity={0.01} d="M0 0h48v48H0z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 41c9.941 0 18-8.322 18-14s-8.059-14-18-14S6 21.328 6 27s8.059 14 18 14Z"
      fill="#2F88FF"
      stroke="#9251a4"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M24 33a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
      fill="#ab73bf"
      stroke="#fff"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="m13.264 11.266 2.594 3.62m19.767-3.176-2.595 3.62M24.009 7v6"
      stroke="#9251a4"
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);
export default Preview;
