import { STATUS_LABELS, STATUS_ORDER, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_ORDER, toCustomerStatus } from '@/lib/constants';

export default function TicketTimeline({ status, simplified = false }) {
  const order = simplified ? CUSTOMER_STATUS_ORDER : STATUS_ORDER;
  const labels = simplified ? CUSTOMER_STATUS_LABELS : STATUS_LABELS;
  const resolvedStatus = simplified ? toCustomerStatus(status) : status;

  if (resolvedStatus === 'cancelled') {
    return (
      <div className="timeline">
        <div className="timeline-step done cancelled">
          <span className="timeline-dot">✕</span>
          <span className="timeline-label">Cancelled</span>
        </div>
      </div>
    );
  }

  const currentIndex = order.indexOf(resolvedStatus);

  return (
    <div className="timeline">
      {order.map((s, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
        return (
          <div key={s} className={`timeline-step ${state}`}>
            <span className="timeline-dot">{state === 'done' ? '✓' : i + 1}</span>
            <span className="timeline-label">{labels[s]}</span>
          </div>
        );
      })}
    </div>
  );
}
