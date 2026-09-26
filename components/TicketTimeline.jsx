import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';

export default function TicketTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="timeline">
        <div className="timeline-step done cancelled">
          <span className="timeline-dot">✕</span>
          <span className="timeline-label">Cancelled</span>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="timeline">
      {STATUS_ORDER.map((s, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
        return (
          <div key={s} className={`timeline-step ${state}`}>
            <span className="timeline-dot">{state === 'done' ? '✓' : i + 1}</span>
            <span className="timeline-label">{STATUS_LABELS[s]}</span>
          </div>
        );
      })}
    </div>
  );
}
