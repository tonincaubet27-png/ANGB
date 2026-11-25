// Rejoué à chaque changement de page : petit fondu avec glissement (voir .page-enter dans globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
