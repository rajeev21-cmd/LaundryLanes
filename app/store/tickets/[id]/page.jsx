'use client';

import TicketDetail from '@/components/TicketDetail';

export default function StoreTicketDetailPage({ params }) {
  return <TicketDetail ticketId={params.id} />;
}
