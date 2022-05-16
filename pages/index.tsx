import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { run, setup } from "../utils/shooter";
import Game from "../components/Game";
import { useState } from "react";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <meta name="description" content="Sapce Nation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="hidden md:flex">
          <h1
            id="start"
            className={styles.title}
            onClick={function (event) {
              setup();
              run();
              setTimeout(function () {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }, 1);
            }}
          >
            Space Nation
          </h1>
        </div>
        <div className="flex md:hidden">
          <h1 className={styles.title}>Space Nation</h1>
        </div>
        <p className={styles.description}>
          <a
            className="hover:animate-pulse"
            href="https://discord.gg/5M6ZBjXdan"
            target="_blank"
          >
            ENTER DISCORD
          </a>
        </p>
        <div id="menu"></div>
      </main>

      <div className="text-left justify-center justify-self-center hidden md:flex">
        <Game />
      </div>
    </div>
  );
};

export default Home;
