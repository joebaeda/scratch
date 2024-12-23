import * as React from "react";
import { SVGProps } from "react";

const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    data-name="Flat Line"
    xmlns="http://www.w3.org/2000/svg"
    className="icon flat-line"
    {...props}
  >
    <g strokeWidth={0} />
    <g strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9m0 11.14a1 1 0 0 1-1.5.69l-3.12-2.14a.82.82 0 0 1 0-1.38l3.12-2.14a1 1 0 0 1 1.5.69Z"
      style={{
        fill: "#7e354e",
        strokeWidth: 2,
      }}
    />
    <path
      d="M17 12h-5m-4.63.69 3.13 2.14a1 1 0 0 0 1.5-.69V9.86a1 1 0 0 0-1.5-.69l-3.12 2.14a.82.82 0 0 0-.01 1.38M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9"
      style={{
        fill: "none",
        stroke: "#311535",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
      }}
    />
  </svg>
);
export default ArrowLeft;
