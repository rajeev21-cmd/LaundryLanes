import { STATUS_LABELS, CUSTOMER_STATUS_LABELS, toCustomerStatus } from '@/lib/constants';

export default function StatusBadge({ status, simplified = false }) {
  if (simplified) {
    const cStatus = toCustomerStatus(status);
    return <span className={`status-badge cstatus-${cStatus}`}>{CUSTOMER_STATUS_LABELS[cStatus] || cStatus}</span>;
  }
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}
