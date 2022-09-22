import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { PrismicRichText } from '@prismicio/react'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import router, { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

 export default function Post({ post }: PostProps) {
    // TODO

    const { isFallback } = useRouter();

    if(isFallback){
      return <h1>Carregando...</h1>
    }

    const countWords = post.data.content.reduce((acc, currentValue) => {
      acc += currentValue.heading.split(' ').length;
  
      const words = currentValue.body.map(item => item.text.split(' ').length);
  
      words.map(word => 
        (acc += word));
  
      return acc;
    }, 0);
  
    const timeRead = Math.ceil(countWords / 200);

    return (
      <>
            <Header />
            <img src={post.data.banner.url} alt={post.data.banner.alt} className={styles.image}/>
            <section className={styles.content}>
              <h1>{post.data.title}</h1>
              <section className={styles.about}>
                <div>
                  <FiCalendar fontSize={20}/>
                  <time dateTime={post.first_publication_date} >
                    {post.first_publication_date}
                  </time>
                </div>

                <div>
                  <FiUser fontSize={20}/>
                  <span>
                    {post.data.author}
                  </span>
                </div>


                <div>
                  <FiClock fontSize={20}/>
                  <span>
                    {timeRead} min
                  </span>
                </div>


              </section>
              <section className={styles.group_content}>
                {post.data.content.map(group => (
                    <article key={group.heading} className={styles.group}>
                      <h2>{group.heading}</h2>
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: RichText.asHtml(group.body)
                        }}
                      />
                    </article>
                ))}
              </section>
            </section>
      </>
    )
 }

 export const getStaticPaths = async () => {
   const prismic = getPrismicClient({});
   const posts = await prismic.getByType('posts');
   
   const paths = posts.results.map(post => {
      return {
        params: {
          slug: post.uid
        }
      }
    }
  )

  return {
    paths,
    fallback: true 
  }
   
 };

 export const getStaticProps: GetStaticProps = async ({ params }) => {
  
  const { slug } = params;
  
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {}); // Busca um post no prismic pelo slug

  const { data } = response;

  const post: Post = {
    first_publication_date: format(new Date(response.first_publication_date), 'dd MMM yyyy', { locale: ptBR}),
    data: {
      title: data.title,
      author: data.author,
      banner: {
        url: data.banner.url,
        alt: data.banner.alt,
      },
      content: data.content.map(group => {
        return {
          heading: group.heading,
          body: group.body
        }
      })
    }
  }
  
    // TODO
    return {
      props: {
        post
      }, revalidate: 60 * 60 // 1 hour
    }
 };
