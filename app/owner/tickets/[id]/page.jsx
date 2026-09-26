'use client';

import TicketDetail from '@/components/TicketDetail';

export default function OwnerTicketDetailPage({ params }) {
  return <TicketDetail ticketId={params.id} />;
}
