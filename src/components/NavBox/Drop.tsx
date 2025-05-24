// src/components/Drop.tsx
import * as React from "react";

interface DropProps extends React.SVGProps<SVGSVGElement> {}

const Drop: React.FC<DropProps> = (props) => (
  <svg
    viewBox="-1 -1 34 34"
    fill="none"
    stroke="#002038"
    strokeWidth={0.55} // <-- a clear, single outline
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M15.95 31.959c-6.041 0-10.956-4.848-10.956-10.806 0-6.959 9.739-20.151 10.153-20.71 0.188-0.252 0.482-0.402 0.796-0.404 0.349-0.003 0.611 0.144 0.802 0.393 0.419 0.548 10.261 13.507 10.261 20.721 0 5.959-4.96 10.806-11.056 10.806z" />
  </svg>
);

export default Drop;
