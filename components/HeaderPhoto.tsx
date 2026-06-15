/**
 * Photo en fondu derrière un en-tête de page.
 * À placer comme 1er enfant d'un conteneur `relative overflow-hidden`,
 * le contenu (titre…) devant être dans un wrapper `relative`.
 * Photo désaturée + très atténuée + dégradé navy à gauche pour la lisibilité.
 */
export default function HeaderPhoto({
  src,
  position = 'center',
}: {
  src: string
  position?: string
}) {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: position,
          opacity: 0.16,
          filter: 'grayscale(65%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, var(--navy) 0%, rgba(7,11,21,0.6) 45%, rgba(7,11,21,0.1) 100%), linear-gradient(180deg, rgba(74,127,255,0.10) 0%, transparent 100%)',
        }}
      />
    </>
  )
}
