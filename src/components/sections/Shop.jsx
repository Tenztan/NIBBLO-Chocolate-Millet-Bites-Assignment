"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Shop.module.css";

const PRICE = 199;

export default function Shop({ onAdd, go }) {
  const [qty, setQty] = useState(2);
  const [added, setAdded] = useState(false);
  const confirmation = useRef(null);
  useEffect(() => () => clearTimeout(confirmation.current), []);
  const add = event => {
    onAdd(qty, event.currentTarget);
    setAdded(true);
    clearTimeout(confirmation.current);
    confirmation.current = setTimeout(() => setAdded(false), 1800);
  };
  const jump = id => event => {
    event.preventDefault();
    go(id);
  };

  return (
    <div className={styles.finale}>
      <section id="shop" className={styles.stage} data-section="shop" aria-labelledby="shop-title">
        <div className={styles.head}>
          <h2 id="shop-title" className={styles.title}>
            <span className="line"><span data-shop-line>Your new</span></span>
            <span className="line"><span data-shop-line><em>4 pm</em> habit.</span></span>
          </h2>
        </div>

        <div className={styles.prints} aria-hidden="true">
          <div className={styles.deskPrint} data-shop-print>
            <Image src="/finale/desk-print.webp" alt="" loading="eager" fetchPriority="low" fill sizes="(max-width:760px) 20vw, 14vw" unoptimized />
          </div>
          <div className={styles.roadPrint} data-shop-print>
            <Image src="/finale/road-print.webp" alt="" loading="eager" fetchPriority="low" fill sizes="(max-width:760px) 18vw, 13vw" unoptimized />
          </div>
        </div>

        <div className={styles.pack} data-shop-pack data-pouch-anchor="shop">
          <Image data-pack-poster src="/pack/front.webp" alt="NIBBLŌ chocolate millet bites pouch" width={441} height={640} sizes="(max-width:760px) 40vw, 21vw" />
        </div>
        <div className={styles.details}>
          <h3>Chocolate <br />Millet Bites.</h3>
          <p>High fibre · No maida · Baked, not fried</p>
        </div>
        <div className={styles.buy} data-shop-buy>
          <p className={styles.price}><b>₹{PRICE * qty}</b><span>{qty} × 150 g</span></p>
          <div className={styles.row}>
            <div className={styles.qty} role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty(q => q - 1)} disabled={qty === 1} aria-label="One less">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty(q => q + 1)} disabled={qty === 9} aria-label="One more">+</button>
            </div>
            <button type="button" className={styles.add} onClick={add} data-added={added || undefined}>
              {added ? "Added to bag" : "Add to bag"}
            </button>
          </div>
          <p className={styles.shipping}>Free shipping on two packs or more.</p>
        </div>
      </section>

      <footer className={styles.footer} data-finale-footer aria-label="NIBBLŌ footer">
        <div className={styles.backdrop} aria-hidden="true">
          <Image src="/finale/snack-break.webp" alt="" fill sizes="100vw" unoptimized />
        </div>
        <Image className={styles.biteSticker} data-footer-bite src="/finale/bite-sticker.webp" alt="" width={491} height={455} sizes="25vw" />
        <div className={styles.sign}>
          <p className={styles.endTitle} aria-label="NIBBLŌ Millet Bites">
            <span className="line" aria-hidden="true"><span data-footer-line>“NIBBLŌ”</span></span>
            <span className="line" aria-hidden="true"><span data-footer-line>Millet bites</span></span>
          </p>
          <a className={styles.tape} href="#top" onClick={jump("top")} data-footer-tape>Back to top <span aria-hidden="true">↑</span></a>
        </div>
        <Image className={styles.pouchSticker} data-footer-pouch src="/pack/three_quarter.webp" alt="" width={363} height={640} sizes="22vw" />
        <div className={styles.colophon}>
          <small>© 2026 NIBBLŌ Foods · A concept site</small>
          <nav aria-label="Footer"><a href="#ingredients" onClick={jump("ingredients")}>Inside</a><a href="#shop" onClick={jump("shop")}>Shop</a></nav>
        </div>
      </footer>
    </div>
  );
}
