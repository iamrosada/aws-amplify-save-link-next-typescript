import { Amplify, API, withSSRContext } from "aws-amplify";
import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import awsExports from "../../aws-exports";
import { useRouter } from "next/router";
import { DeleteSongInput, GetSongQuery, ListSongsQuery, Song } from "../../API";
import { getSong, listSongs } from "../../graphql/queries";
import styles from "../../styles/Home.module.css";
import { deleteSong } from "../../graphql/mutations";

Amplify.configure({ ...awsExports, ssr: true });
function SongPage({ song }: { song: Song }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete(): Promise<void> {
    try {
      const deleteInput: DeleteSongInput = {
        id: song.id,
      };

      await API.graphql({
        query: deleteSong,
        variables: {
          input: deleteInput,
        },
      });

      router.push(`/`);
    } catch ({ errors }) {
      //  console.error(...errors);
      //  throw new Error(errors[0].message);
    }
  }

  return (
    <div>
      <Head>
        <title>{song.title} – Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{song.title}</h1>
        <p className={styles.description}>{song.description}</p>
      </main>

      <footer>
        <button className={styles.footer} onClick={handleDelete}>
          💥 Delete song
        </button>
      </footer>
    </div>
  );
}

export const getStaticPaths = async () => {
  const SSR = withSSRContext();

  const songsQuery = (await SSR.API.graphql({
    query: listSongs,
  })) as { data: ListSongsQuery; errors: any[] };

  const paths = songsQuery.data?.listSongs?.items.map((song) => ({
    params: { id: song?.id },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const SSR = withSSRContext();

  const response = (await SSR.API.graphql({
    query: getSong,
    variables: {
      id: params.id,
    },
  })) as { data: GetSongQuery };

  return {
    props: {
      song: response.data.getSong,
    },
  };
};
export default SongPage;
