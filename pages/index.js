import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>CLI App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Spartan:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          COMMAND <span style={{ fontSize: "1.2rem", verticalAlign: "middle" }}>LINE</span> INTERFACE
        </h1>

        <p className={styles.description}>
          Please select the CLI you would like to try
        </p>

        <div className={styles.grid}>
          <Link href='/fileSystemPage'>
            <div className={styles.card}>
              <h2>File Directory &rarr;</h2>
              <p>Navigate and manipulate files and directory with File System.</p>
            </div>
          </Link>

          <Link href={'/btoolPage'}>
            <div className={styles.card}>
              <h2>Book Search &rarr;</h2>
              <p>Search your favorite book or author with Open Library API</p>
            </div>
          </Link>

          <Link href={'/cctoolPage'}>
            <div className={styles.card}>
              <h2>Currency Convert &rarr;</h2>
              <p>Check live foreign currency exchange rates with exchangerates API</p>
            </div>
          </Link>

          <Link href={'/mtoolPage'}>
            <div className={styles.card}>
              <h2>Math Tools &rarr;</h2>
              <p>Quick calculations for addition, exponentiation, logarithm, etc.</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        copyright &copy;2022 Taesok Kwon
      </footer>
    </div>
  )
}