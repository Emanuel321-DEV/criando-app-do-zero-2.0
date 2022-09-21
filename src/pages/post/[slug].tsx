import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { PrismicRichText } from '@prismicio/react'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { asHTML } from '@prismicio/helpers';

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


    return (
      <>
            <Header />
            <img src={post.data.banner.url} alt={post.data.banner.alt} className={styles.image}/>
            <section className={styles.content}>
              <h1>{post.data.title}</h1>
              <section className={styles.about}>
                <div>
                  <FiCalendar />
                  <time dateTime={post.first_publication_date} >
                    {post.first_publication_date}
                  </time>
                </div>

                <div>
                  <FiUser />
                  <span>
                    {post.data.author}
                  </span>
                </div>


                <div>
                  <FiClock />
                  <span>
                    10 min
                  </span>
                </div>


              </section>
              <section className={styles.group_content}>
                {post.data.content.map(group => (
                    <article className={styles.group}>
                      <h1>{group.heading}</h1>
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

 export const getStaticProps = async ({ params }) => {
  
  const { slug } = params;
  
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const { data } = response;

  console.log("ESTE EH DATA", data)

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
      banner: {
        url: data.banner.url,
        alt: data.banner.alt,
      },
      content: data.content.map(group => {
        return {
          heading: group.heading,
          body: [...group.body]
        }
      })
    }
  }


  
    // TODO
    return {
      props: {
        post
      }
    }
 };
