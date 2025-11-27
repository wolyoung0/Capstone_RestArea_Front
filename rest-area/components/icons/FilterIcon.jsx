import React from 'react';

export const FilterIcon = (props) => (
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
    <line x1="4" x2="20" y1="21" y2="21" />
    <line x1="4" x2="20" y1="3" y2="3" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="8" y1="8" y2="8" />
    <line x1="16" x2="20" y1="16" y2="16" />
    <circle cx="14" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </svg>
);