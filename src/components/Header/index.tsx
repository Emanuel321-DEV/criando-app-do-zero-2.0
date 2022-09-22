import Link from "next/link";
import styles from "./header.module.scss";

export default function Header() {
  // TODO

  return (
    <header className={styles.header}>
      <Link href="/" >
        <img src="/Logo.svg" alt="logo"/>      
      </Link>
    </header>
  )
}
