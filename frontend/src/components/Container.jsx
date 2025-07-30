// components/Container.tsx
const Container = ({ children, className = "" }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-4 lg:py-16 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
