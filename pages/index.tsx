import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import Game from "../components/Game";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Space Nation</title>
        <meta name="description" content="Sapce Nation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Space Nation</h1>

        <p className={styles.description}>ENTER DISCORD</p>
      </main>
      <Game />
    </div>
  );
};

export default Home;
