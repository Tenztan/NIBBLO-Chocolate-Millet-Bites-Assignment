import styles from "./Why.module.css";

// Line icons drawn to match the pack's claim badges.
const ICONS = {
  fibre: <path d="M12 21V9M12 13c-3-1-5-4-5-8 3 0 5 2 5 5M12 11c3-1 5-4 5-8-3 0-5 2-5 5M12 17c-2-1-4-3-4-6M12 16c2-1 4-3 4-6" />,
  maida: <><circle cx="12" cy="12" r="8.5" /><path d="M6 18 18 6M9 9c1.5-1.2 4.5-1.2 6 0M8.5 13c2 1.3 5 1.3 7 0" /></>,
  choc: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M5 9.5h14M5 15h14M12 4v16" /></>,
  baked: <><path d="M4 12h16l-1.5 7h-13Z" /><path d="M8 9c0-2 2-2 2-4M12 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4" /></>,
};
export const CLAIMS = [
  ["fibre", "High fibre", "Whole jowar and ragi keep you full until dinner, not just until the next meeting."],
  ["maida", "No maida", "No refined flour anywhere. The crunch comes from grains and rice crisp."],
  ["choc", "Rich chocolate", "A proper dark chocolate coat with cocoa, sweetened with jaggery."],
  ["baked", "Baked, not fried", "Oven-toasted clusters, so you get the crackle without the oil."],
];

// Pinned: the bite rolls across the four claims; each card lights up as it passes over.
export default function Why() {
  return (
    <section id="why" className={styles.why} data-section="why">
      <div className={styles.stage}>
        <div className={styles.head}>
          <p className={`mono ${styles.kicker}`}>Why NIBBLŌ</p>
          <h2 className={styles.title}><span className="line"><span data-why-line>Good for you,</span></span><span className="line"><span data-why-line>without the lecture.</span></span></h2>
        </div>
        <div className={styles.cards}>
          {CLAIMS.map(([key, title, body]) => (
            <article key={key} className={styles.card} data-claim>
              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[key]}</svg>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
