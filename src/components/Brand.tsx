export default function Brand({ href = '/admin' }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="AI Trainers admin home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <b />
      </span>
      <span>AI Trainers</span>
    </a>
  );
}
