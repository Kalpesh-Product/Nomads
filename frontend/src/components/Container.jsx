// components/Container.tsx
const Container = ({ children, className = "", padding = true }) => {
  return (
    <div
      className={`min-w-[70%] max-w-[80rem] lg:max-w-[70rem] mx-0 md:mx-auto px-6 sm:px-6 lg:px-0  ${
        padding ? "lg:py-16 py-10" : "lg:py-0 py-0"
      } ${className}`}>
      {children}
    </div>
  );
};

export default Container;
