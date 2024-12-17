import * as React from "react";
import { SVGProps } from "react";

const ScratchLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="60 40 280 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g strokeWidth={0} />
    <g strokeLinecap="round" strokeLinejoin="round" />
    <g
      stroke="#000"
      strokeOpacity={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M117.762 93.545c59.654-86.305 168.457 52.66 92.001 109.541-59.411 44.205-129.16-24.695-101.268-84.645M88 321.134c45.281-1.085 55.28-86.841 105.563-77.798q17.254 3.103 63.865 39.238 34.668-90.985 41.698-104.26"
        strokeWidth={16}
      />
      <path
        d="M176.828 250.418c-3.914 25.687-4.73 64.421-7.724 84.582m106.85-158.072c12.339-2.113 24.003-5.874 36.046-8.32"
        strokeWidth={16}
      />
      <path
        opacity={0.503}
        d="M311.262 172.768c-11.352 14.588 4.193 138.552 0 141.585-1.719 1.244-25.122-1.431-53.975-1.431-21.965 0-42.47 5.997-50.759 0-.967-.699 0-11.152 0-12.872 0-29.117-.188-59.34-3.953-87.952m33.471-91.176c23.257-.684 46.223 0 69.517 0"
        strokeWidth={14}
      />
    </g>
  </svg>
);
export default ScratchLogo;
