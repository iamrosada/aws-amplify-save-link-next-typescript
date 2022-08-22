import type {
  GetServerSideProps,
  NextPage,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { Amplify, API, withSSRContext } from "aws-amplify";
import Head from "next/head";
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
  const [isLike, setIsLike] = useState(0);
  async function handleCreatesong(event: any) {
    event.preventDefault();
    const form = new FormData(event.target);

    try {
      const createInput: CreateSongInput = {
        description: form.get("content")?.toString() || "",
        like: isLike,
        filePath: form.get("filepath")?.toString() || "",
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
      // console.error(...errors:);
      // throw new Error(errors[0].message);
    }
  }
  return (
    <div>
      <span>
        {songs.map((song) => (
          <a href={`/song/${song.id}`} key={song.id}>
            <h3>{song.title}</h3>
            <p>{song.description}</p>
          </a>
        ))}
      </span>
      <div className={styles.card}>
        <h3 className={styles.title}>New Song</h3>

        <form onSubmit={handleCreatesong}>
          <fieldset>
            <legend>Title</legend>
            <input defaultValue="Type your song favorite" name="title" />
          </fieldset>
          <fieldset>
            <legend>file path</legend>
            <input defaultValue="filepath" name="filepath" />
          </fieldset>
          <fieldset>
            <legend> number</legend>
            <input
              name="like"
              placeholder="is number"
              type="number"
              onChange={(e) => setIsLike(parseInt(e.target.value))}
            />
          </fieldset>
          <fieldset>
            <legend>owner</legend>
            <input name="owner" />
          </fieldset>
          <fieldset>
            <legend>Content</legend>
            <textarea
              defaultValue="I built an Amplify app with Next.js!"
              name="content"
            />
          </fieldset>

          <button>Create song</button>
        </form>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });

  const response = (await SSR.API.graphql({ query: listSongs })) as {
    data: ListSongsQuery;
  };

  return {
    props: {
      songs: response.data.listSongs?.items,
    },
  };
};

export default Home;
