/// <reference types="vite/client" />

// SVG module declarations
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import React = require('react');
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Additional asset declarations (optional but recommended)
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}