import React from 'react';
import './ui.css';

export function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      className={`mv-card ${hover ? 'mv-card--hover' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mv-card-header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`mv-card-title ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`mv-card-description ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`mv-card-content ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`mv-card-footer ${className}`} {...props}>
      {children}
    </div>
  );
}
