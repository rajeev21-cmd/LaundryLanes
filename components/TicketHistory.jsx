import { STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';

export default function TicketHistory({ history }) {
  if (!history || history.length === 0) {
    return <p className="form-hint">No history yet.</p>;
  }

  const entries = [...history].reverse();

  return (
    <ul className="history-list">
      {entries.map((entry, i) => (
        <li key={i} className="history-item">
          <div className="history-item-top">
            <span className="history-item-status">{STATUS_LABELS[entry.status] || entry.status}</span>
            <span className="history-item-time">{formatDateTime(entry.at)}</span>
          </div>
          {entry.note && entry.note !== STATUS_LABELS[entry.status] && (
            <div className="history-item-note">{entry.note}</div>
          )}
          <div className="history-item-actor">{entry.byName}{entry.byRole ? ` · ${entry.byRole}` : ''}</div>
        </li>
      ))}
    </ul>
  );
}
