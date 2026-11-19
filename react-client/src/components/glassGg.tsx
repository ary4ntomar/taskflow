import React from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

// 1. Extend React's native CSSProperties to support vendor-prefixed properties smoothly
interface ExtendedCSSProperties extends React.CSSProperties {
  WebkitBackdropFilter?: string;
  backdropFilter?: string;
}

// 2. Define the TypeScript interface for your props
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  blur?: string;
  opacity?: number;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  width?: string;
}

export default function GlassCard({ 
  children, 
  blur = '12px', 
  opacity = 0.15, 
  borderColor = 'rgba(255, 255, 255, 0.25)',
  borderRadius = '16px',
  padding = '24px',
  width = '100%',
  style = {},
  ...props 
}: GlassCardProps) {
  
  // Use our customized interface for typing the style object
  const glassStyle: ExtendedCSSProperties = {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`, 
    border: `1px solid ${borderColor}`,
    borderRadius: borderRadius,
    padding: padding,
    width: width,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    ...style 
  };

  return (
    <div style={glassStyle as React.CSSProperties} {...props}>
      {children}
    </div>
  );
}
