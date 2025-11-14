import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import humanDate from "../utils/humanDate";

const BlogDetails = () => {
  // const newsContent = [
  //   {
  //     id: 1,
  //     title: "Content Title 1",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 2,
  //     title: "Content Title 2",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 3,
  //     title: "Content Title 3",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 4,
  //     title: "Content Title 4",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  // ];
  const location = useLocation();
  const { content } = location.state;
  console.log("content : ", content);
  const newsContent = content?.sections || [];
  return (
    <div className="min-w-[70%] max-w-[80rem] lg:max-w-[70rem] mx-0 md:mx-auto p-4 lg:p-0">
      <div className="flex flex-col gap-8">
        <section className="space-y-8">
          <h1 className="text-title leading-normal font-bold">
            {content?.mainTitle ||
              content?.title ||
              "Lorem ipsum dolor sit amet consectetur adipisicing elit."}
          </h1>
          <div className="h-96 rounded-xl w-full overflow-hidden">
            <img
              src={
                content?.mainImage ||
                content?.image ||
                "https://wallpapercave.com/wp/w8Lgiy5.jpg"
              }
              alt="main-image"
              className="object-cover h-full w-full"
            />
          </div>
          <p>
            {content?.mainContent ||
              content?.content ||
              "Main Content goes here"}
          </p>
        </section>
        <hr />
        <section className="flex flex-col gap-8">
          {newsContent &&
            newsContent.map((item) => (
              <article key={item.id} className="space-y-4">
                <h1 className="text-card-title font-bold">{item.title}</h1>
                {item.image && (
                  <div className="h-96 rounded-xl w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt="main-image"
                      className="object-cover h-full w-full"
                    />
                  </div>
                )}
                <p>{item.content}</p>
              </article>
            ))}
        </section>
        <hr />
        <footer className="flex w-full justify-between items-center">
          <p>{content?.author || ""}</p>
          <p>{humanDate(content?.date) || new Date().toLocaleString()}</p>
          <p>
            {typeof content?.source === "object"
              ? content?.source?.name || "Source"
              : content?.source || "Source"}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BlogDetails;
