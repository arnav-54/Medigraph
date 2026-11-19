import React from 'react';
import './ui.css';

export function Table({ children, className = '', ...props }) {
  return (
    <div className="mv-table-container">
      <table className={`mv-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return <thead className={`mv-table-header ${className}`} {...props}>{children}</thead>;
}

export function TableBody({ children, className = '', ...props }) {
  return <tbody className={`mv-table-body ${className}`} {...props}>{children}</tbody>;
}

export function TableRow({ children, className = '', hover = true, ...props }) {
  return (
    <tr className={`mv-table-row ${hover ? 'mv-table-row--hover' : ''} ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  return (
    <th className={`mv-table-head mv-table-head--${align} ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  return (
    <td className={`mv-table-cell mv-table-cell--${align} ${className}`} {...props}>
      {children}
    </td>
  );
}
