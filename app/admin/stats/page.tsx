// Tableau de bord statistiques — agrégé & anonymisé (RGPD). Accès admin uniquement.
import Link from 'next/link'
import { getAdminEmail } from '@/lib/admin-auth'
import { getSiteStats, type Distribution } from '@/lib/admin-stats'

export const dynamic = 'force-dynamic'

function Kpi({ label, value, sub, color = '#4a7fff' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#0d1525', border: '1px solid #1e293b', borderTop: `3px solid ${color}`, borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-bebas, sans-serif)', letterSpacing: '0.02em' }}>{value}</p>
      <p style={{ fontSize: 12, color: '#cbd5e1', margin: '2px 0 0', fontWeight: 600 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  )
}

function BarList({ title, data, color = '#4a7fff' }: { title: string; data: Distribution[]; color?: string }) {
  const max = Math.max(1, ...data.map(d => d.count))
  return (
    <div style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: '18px 20px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>{title}</h3>
      {data.length === 0 ? (
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Aucune donnée</p>
      ) : data.map(d => (
        <div key={d.label} style={{ marginBottom: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: '#cbd5e1' }}>{d.label}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{d.count}</span>
          </div>
          <div style={{ height: 6, background: '#070b15', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(d.count / max) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function StatsPage() {
  const adminEmail = getAdminEmail()
  if (!adminEmail) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>Statistiques réservées au bureau.</p>
          <Link href="/admin" style={{ color: '#4a7fff', fontSize: 13 }}>Se connecter →</Link>
        </div>
      </main>
    )
  }

  const s = await getSiteStats()
  if (!s) {
    return <main style={{ minHeight: '100vh', background: '#070b15', color: '#fca5a5', padding: 32 }}>Supabase non configuré.</main>
  }

  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 18 }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 28, letterSpacing: '0.08em', color: '#fff', margin: '0 0 4px' }}>
                Statistiques · données anonymisées
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Aucune donnée personnelle · agrégats uniquement</p>
            </div>
            <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #1e293b', background: '#0d1525', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
          </div>
        </div>

        {/* KPIs — fréquentation */}
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', margin: '0 0 10px' }}>Fréquentation</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          <Kpi label="Comptes créés" value={s.accounts} />
          <Kpi label="Connectés (7 j)" value={s.active7} color="#34d399" sub="se sont connectés" />
          <Kpi label="Connectés (30 j)" value={s.active30} color="#34d399" />
          <Kpi label="Nouveaux comptes (30 j)" value={s.signups30} color="#fbbf24" />
        </div>

        {/* KPIs — adhésions & activité */}
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', margin: '0 0 10px' }}>Adhésions & activité</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
          <Kpi label="Membres actifs" value={s.activeMembers} color="#34d399" />
          <Kpi label="Adhésions en attente" value={s.pending} color="#fbbf24" />
          <Kpi label="Demandes d'adhésion" value={s.adhesionTotal} sub={`${s.byStatus.validated} validées · ${s.byStatus.rejected} refusées`} />
          <Kpi label="Sujets forum" value={s.threads} color="#c084fc" />
          <Kpi label="Messages forum" value={s.posts} color="#c084fc" />
          <Kpi label="Messages privés" value={s.messages} color="#c084fc" sub="nombre (contenu jamais lu)" />
          <Kpi label="Annonces équipement" value={s.listings} color="#fb923c" />
        </div>

        {/* Répartitions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
          <BarList title="Adhésions par mois" data={s.adhesionsByMonth} color="#4a7fff" />
          <BarList title="Par catégorie" data={s.byCategory} color="#34d399" />
          <BarList title="Par division" data={s.byDivision} color="#c084fc" />
          <BarList title="Par région" data={s.byRegion} color="#fb923c" />
          <BarList title="Par tranche d'âge" data={s.byAge} color="#ED2939" />
        </div>

        {/* Export + RGPD */}
        <div style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Export pour analyse</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 14px' }}>
            Fichier CSV (ouvrable dans Excel) <strong style={{ color: '#fff' }}>sans aucun identifiant direct</strong> :
            pas de nom, e-mail, téléphone, adresse ni date de naissance exacte. Uniquement catégorie, division,
            club, cotisation, statut, mois d'inscription et tranche d'âge. Idéal pour une analyse externe respectueuse du RGPD.
          </p>
          <a href="/api/admin/export"
            style={{ display: 'inline-block', padding: '9px 16px', borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ⬇️ Télécharger l'export anonymisé (CSV)
          </a>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1e293b' }}>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              🔒 <strong style={{ color: '#94a3b8' }}>RGPD</strong> — Ces données sont anonymisées et agrégées. L'accès est
              réservé au bureau. En partageant l'export avec un tiers, l'association reste responsable : limite-toi
              au strict nécessaire, ne recoupe pas avec d'autres fichiers permettant de ré-identifier une personne,
              et conserve le fichier de façon sécurisée. Snapshot généré le {new Date(s.generatedAt).toLocaleString('fr-FR')}.
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
