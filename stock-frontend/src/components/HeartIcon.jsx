import React from "react";

export function HeartIcon({ filled = false, ...props }) {
  return filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#ef4444"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#ef4444"
      className="w-6 h-6"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 6.712a5.478 5.478 0 00-7.78-.206l-.972.95-.972-.95a5.478 5.478 0 00-7.78.206 5.507 5.507 0 00.213 7.777l7.385 7.385a.75.75 0 001.06 0l7.385-7.385a5.507 5.507 0 00.213-7.777z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#ef4444"
      className="w-6 h-6"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 6.712a5.478 5.478 0 00-7.78-.206l-.972.95-.972-.95a5.478 5.478 0 00-7.78.206 5.507 5.507 0 00.213 7.777l7.385 7.385a.75.75 0 001.06 0l7.385-7.385a5.507 5.507 0 00.213-7.777z"
      />
    </svg>
  );
}
