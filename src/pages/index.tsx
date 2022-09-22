import { GetStaticProps } from 'next';
import ptBR from 'date-fns/locale/pt-BR';


import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';

import styles from './home.module.scss';
import { useState } from 'react';

import { FiUser, FiCalendar } from "react-icons/fi";
import Header from '../components/Header';

import Link from "next/link";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

 export default function Home({ postsPagination }: HomeProps) {
    // TODO

    const [ posts, setPosts ] = useState(postsPagination.results);
    const [ next_page, setNextPage ] = useState(postsPagination.next_page);

    // Faz a busca de mais posts do prismic, caso o cliente solicite.
    async function handleNextPage () {
      const nextPage = await fetch(next_page);

      const nextPageJSON = await nextPage.json();

      const nextPageConverted = nextPageJSON.results.map((post: Post) => {

        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data:  { 
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
          },
        }
      })
      
      const postsUpdated = {
        nextPage: nextPageJSON.next_page,
        results: nextPageConverted,
      }

      setPosts([...posts, ...postsUpdated.results]);

      setNextPage(postsUpdated.nextPage);


    }

    return (
        <>
          <Header />
          <section className={styles.section_articles}>
            {posts.map((post: Post) =>
              
              ( 
                <Link key={post.uid} href={`/post/${post.uid}`}>

                  <article>
                  <h2>{post.data?.title}</h2>
                  <p>{post.data?.subtitle}</p>  

                  <section className={styles.section_author_date}>

                    <div>

                      <FiCalendar />
                      <time dateTime={post.first_publication_date} >
                        {format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}
                      </time>
                    
                    </div>
                    
                    <div>
                      <FiUser />
                      <span>{post.data?.author}</span>
                    </div>
                  
                  </section>
                  </article>
                </Link>
              )
            )}
            {next_page ? <button className={styles.load_more_posts} onClick={() => handleNextPage()}> Carregar mais posts </button> : ''}
          </section>
        </>

    )
 }

 export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient({});
    const postsResponse = await prismic.getByType('posts', { pageSize: 1 }); // Busca as publicacoes no prismic do tipo 'posts', e exibe de um em um em tela( pageSize ).  
    
    const posts = postsResponse.results.map((post): Post => {

      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data:  { 
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        },
      }
    })
    
    const postsPagination: PostPagination = {
      next_page: postsResponse.next_page,
      results: posts
    } 
    
    // TODO

    return {
      props: {
        postsPagination
      }, 
      revalidate: 60 * 60 // Refaz a busca de todos o posts no prismic a cada 1 hora
    }
 };
