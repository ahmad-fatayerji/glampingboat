import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      ".next-security/**",
      "generated/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "out/**",
      "node_modules/**",
    ],
  },
];

export default eslintConfig;
