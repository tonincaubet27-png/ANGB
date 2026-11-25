import { redirect } from 'next/navigation'

// Le dépôt d'annonce se fait désormais en 3 étapes depuis la page Équipement.
export default function VendrePage() {
  redirect('/equipement?vendre=1')
}
