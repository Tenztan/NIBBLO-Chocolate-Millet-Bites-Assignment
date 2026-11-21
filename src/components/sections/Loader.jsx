import Wordmark from "../ui/Wordmark";
import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loader} data-loader role="status" aria-label="Loading NIBBLŌ">
      <div className={styles.paper} data-loader-paper />
      <div className={styles.center} data-loader-center aria-hidden="true">
        <div className={styles.word} data-loader-word>
          <Wordmark title={false} />
          <span className={styles.ink}><Wordmark title={false} /></span>
        </div>
        <div className={styles.status} data-loader-status>
          <span>Packing your bites</span>
          <span><b data-loader-pct>0</b>%</span>
        </div>
      </div>
      <noscript><style>{`[data-loader] { display: none !important; }`}</style></noscript>
    </div>
  );
}
