import React from 'react';
import { Box } from '@mui/material';

interface UMDLogoProps {
  size?: number;
}

export const UMDLogo: React.FC<UMDLogoProps> = ({ size = 100 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Background */}
        <path
          d="M 100 10 L 170 40 L 170 100 Q 170 160 100 190 Q 30 160 30 100 L 30 40 Z"
          fill="#E21833"
          stroke="#FFD200"
          strokeWidth="3"
        />

        {/* Maryland Flag Pattern - Simplified */}
        {/* Black and Gold Diagonal */}
        <path
          d="M 100 50 L 120 50 L 120 70 Z"
          fill="#FFD200"
        />
        <path
          d="M 80 50 L 100 50 L 100 70 Z"
          fill="#2C2C2C"
        />

        {/* UMD Text */}
        <text
          x="100"
          y="120"
          textAnchor="middle"
          fill="white"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          UMD
        </text>

        {/* Decorative Stars */}
        <path
          d="M 60 140 L 62 145 L 68 145 L 63 149 L 65 155 L 60 151 L 55 155 L 57 149 L 52 145 L 58 145 Z"
          fill="#FFD200"
        />
        <path
          d="M 140 140 L 142 145 L 148 145 L 143 149 L 145 155 L 140 151 L 135 155 L 137 149 L 132 145 L 138 145 Z"
          fill="#FFD200"
        />
      </svg>
    </Box>
  );
};
