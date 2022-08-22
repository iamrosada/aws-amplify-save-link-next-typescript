import React from "react";
import type { GetServerSideProps } from "next";
import { Amplify, API, withSSRContext } from "aws-amplify";
import awsExports from "../aws-exports";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { listSongs } from "../graphql/queries";
import { createSong } from "../graphql/mutations";
import {
  CreateSongInput,
  CreateSongMutation,
  ListSongsQuery,
  Song,
} from "../API";
import { useState } from "react";

Amplify.configure({ ...awsExports, ssr: true });

const Home = ({ songs = [] }: { songs: Song[] }) => {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [isLike, setIsLike] = useState(0);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  async function handleCreateSong(event: any) {
    event.preventDefault();
    const form = new FormData(event.target);

    try {
      const createInput: CreateSongInput = {
        description: form.get("content")?.toString() || "",
        like: isLike,
        filePath: form.get("filepath")?.toString().substring(17) || "",
        owner: form.get("owner")?.toString() || "",
        title: form.get("title")?.toString() || "",
      };

      const request = (await API.graphql({
        query: createSong,
        variables: {
          input: createInput,
        },
      })) as { data: CreateSongMutation; errors: any[] };

      router.push(`/song/${request.data.createSong?.id}`);
    } catch ({ errors }) {
      console.log(errors);
    }
  }
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.card_music}>
          {songs.map((song) => (
            <a className={styles.cards} href={`/song/${song.id}`} key={song.id}>
              <iframe
                src={`https://www.youtube.com/embed/${song.filePath}/?controls=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <div className={styles.left} key={song.id}>
                <h3 className={styles.title1}>titulo: {song.title}</h3>
                <p className={styles.description}>
                  descrição: {song.description}
                </p>
              </div>
            </a>
          ))}
        </div>
        <div className={styles.card}>
          <h3 className={styles.title}> Nova Musica</h3>

          <form onSubmit={handleCreateSong}>
            <fieldset>
              <legend>Title</legend>
              <input placeholder="escreva a tua musica favorita" name="title" />
            </fieldset>
            <fieldset>
              <legend>Link do youtube</legend>
              <input name="filepath" />
            </fieldset>
            <fieldset>
              <legend>Avaliação, 1 até 10</legend>
              <input
                name="like"
                placeholder="Avaliação, 1 até 10"
                type="number"
                onChange={(e) => setIsLike(parseInt(e.target.value))}
              />
            </fieldset>
            <fieldset>
              <legend>Artista</legend>
              <input name="owner" />
            </fieldset>
            <fieldset style={{ marginBottom: "10px" }}>
              <legend>Diz sobre o teu amor com essa musica</legend>
              <textarea
                defaultValue="Eu amo, essa musica, devido"
                name="content"
              />
            </fieldset>

            <button style={{ width: "100%" }} className={styles.titleback}>
              salva uma musica
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });

  const response = (await SSR.API.graphql({ query: listSongs })) as {
    data: ListSongsQuery;
  };
  console.log(response.data.listSongs?.items);
  return {
    props: {
      songs: response.data.listSongs?.items,
    },
  };
};

export default Home;
