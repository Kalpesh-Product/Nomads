import React from "react";
import { NavLink } from "react-router-dom";

const BlogDetails = () => {
  const newsContent = [
    {
      id: 1,
      title: "Content Title 1",
      image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
    },
    {
      id: 2,
      title: "Content Title 2",
      image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
    },
    {
      id: 3,
      title: "Content Title 3",
      image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
    },
    {
      id: 4,
      title: "Content Title 4",
      image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
    },
  ];
  return (
    <div className="min-w-[70%] max-w-[80rem] lg:max-w-[70rem] mx-0 md:mx-auto p-4 lg:p-0">
      <div className="flex flex-col gap-8">
        <section className="space-y-8">
          <h1 className="text-title leading-normal font-bold">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </h1>
          <div className="h-96 rounded-xl w-full overflow-hidden">
            <img
              src={"https://wallpapercave.com/wp/w8Lgiy5.jpg"}
              alt="main-image"
              className="object-cover h-full w-full"
            />
          </div>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis
            dolorum reprehenderit natus quo facilis ea facere iste illum fugiat
            tenetur, mollitia assumenda pariatur sunt voluptatem itaque quis
            dolore voluptas! Minima molestias tenetur modi tempore velit laborum
            accusantium cupiditate nemo culpa nesciunt ex enim eligendi
            obcaecati ducimus, harum alias provident atque dolore perferendis
            quam deserunt deleniti maiores optio! Accusamus omnis libero cumque
            rem autem voluptates. Quas, cum eos. Dolores, tempore sit?
          </p>
        </section>
        <hr />
        <section className="flex flex-col gap-8">
          {newsContent.map((item) => (
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
          <p>Author</p>
          <p>Date</p>
          <p>Source</p>
          {/* <NavLink className={"underline hover:text-primary-blue"}>
            Read full blog
          </NavLink> */}
        </footer>
      </div>
    </div>
  );
};

export default BlogDetails;
