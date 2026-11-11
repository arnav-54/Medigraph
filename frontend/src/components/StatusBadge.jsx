import React from 'react';

export function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  let badgeClass = 'badge-neutral';
  let label = normalized.replace('_', ' ');

  switch (normalized) {
    case 'COMPLETED':
    case 'VERIFIED':
      badgeClass = 'badge-success';
      break;
    case 'PROCESSING':
    case 'QUEUED':
      badgeClass = 'badge-info';
      break;
    case 'REVIEW_REQUIRED':
    case 'PENDING_REVIEW':
    case 'EDITED':
      badgeClass = 'badge-warning';
      break;
    case 'FAILED':
    case 'REJECTED':
      badgeClass = 'badge-danger';
      break;
    default:
      badgeClass = 'badge-neutral';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
