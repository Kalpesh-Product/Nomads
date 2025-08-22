import React from "react";
import Container from "../components/Container";
import BlogFetch from "../components/BlogFetch";

const LocalBlog = () => {
  return (
    <Container padding={false}>
      {/* <div className="flex justify-center items-center h-screen lg:h-[40vh]">
        <div className="relative border-4 border-dotted border-primary-blue px-10 py-16 rounded-2xl text-center max-w-xl w-full shadow-lg">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-4 border-primary-blue border-dotted rounded-full"></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 border-4 border-primary-blue border-dotted rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-4 border-primary-blue border-dotted rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-4 border-primary-blue border-dotted rounded-full"></div>

          <h1 className="text-4xl font-semibold text-primary-blue mb-4 animate-pulse">
            Coming Soon
          </h1>
          <p className="text-gray-600">
            Stay tuned — Local Blog is arriving shortly!
          </p>
        </div>
      </div> */}

      <div>
        <BlogFetch />
      </div>
    </Container>
  );
};

export default LocalBlog;
