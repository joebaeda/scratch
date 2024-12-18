import * as React from "react";
import { SVGProps } from "react";

const GalleryButton = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1024 1024"
    className="icon"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g strokeWidth={0} />
    <g strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M874.667 896H277.333C230.4 896 192 857.6 192 810.667V384c0-46.933 38.4-85.333 85.333-85.333h597.334C921.6 298.667 960 337.067 960 384v426.667C960 857.6 921.6 896 874.667 896"
      fill="#E65100"
    />
    <path
      d="M746.667 768H149.333C102.4 768 64 729.6 64 682.667V256c0-46.933 38.4-85.333 85.333-85.333h597.334C793.6 170.667 832 209.067 832 256v426.667C832 729.6 793.6 768 746.667 768"
      fill="#F57C00"
    />
    <path d="M576 341.333a64 64 0 1 0 128 0 64 64 0 1 0-128 0" fill="#FFF9C4" />
    <path d="m362.667 381.867-192 279.466h384z" fill="#942A09" />
    <path d="m597.333 501.333-128 160h256z" fill="#BF360C" />
  </svg>
);
export default GalleryButton;
