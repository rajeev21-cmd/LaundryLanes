'use client';

import TicketDetail from '@/components/TicketDetail';

export default function RiderTicketDetailPage({ params }) {
  return <TicketDetail ticketId={params.id} />;
}
