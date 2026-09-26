'use client';

import TicketDetail from '@/components/TicketDetail';

export default function CustomerTicketDetailPage({ params }) {
  return <TicketDetail ticketId={params.id} />;
}
