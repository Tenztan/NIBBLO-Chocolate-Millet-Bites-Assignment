"use client";

import Wordmark from "../ui/Wordmark";
import styles from "./Nav.module.css";

export default function Nav({ go, cart }) {
  const click = id => event => { event.preventDefault(); go(id); };
  return (
    <header className={styles.nav} data-nav>
      <nav className={styles.links} aria-label="Shop and product">
        <a href="#shop" onClick={click("shop")}>Shop</a>
        <a href="#story" onClick={click("story")}>The bites</a>
      </nav>
      <a href="#top" onClick={click("top")} className={styles.mark} aria-label="NIBBLŌ, back to top"><Wordmark /></a>
      <nav className={styles.links} aria-label="Ingredients and bag">
        <a href="#ingredients" onClick={click("ingredients")}>Inside</a>
        <a href="#shop" onClick={click("shop")} data-cart>Bag (<span data-cart-count>{cart}</span>)</a>
      </nav>
    </header>
  );
}
