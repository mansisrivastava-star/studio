import type { SVGProps } from 'react';

export function TurfWarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
      <path d="M12 7V2" />
      <path d="M12 22v-6" />
      <path d="M12 12H2" />
      <path d="M22 12h-6" />
      <path d="M17.1 17.1 15 15" />
      <path d="M9 9 6.9 6.9" />
      <path d="M17.1 6.9 15 9" />
      <path d="M9 15l-2.1 2.1" />
    </svg>
  );
}
