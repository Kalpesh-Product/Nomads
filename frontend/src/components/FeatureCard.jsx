const FeatureCard = ({ title, icon }) => {
  return (
    <div
      style={{
        // padding: "1.5rem 0 1.5rem 0",
        width: "100%",
        borderRadius: "1rem",
      }}
    >
      <div className="flex justify-center items-center gap-4 py-4 flex-col border-b-4 border-y-gray-200 transition-all hover:border-black">
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            overflow: "hidden",
            objectFit: "contain",
            whiteSpace:'none'
          }}
        >
          <img
            style={{ width: "100%", height: "100%" }}
            src={icon}
            alt="image"
          />
        </div>

        <p
          className="text-secondary-dark text-tiny ;g:text-small"
         
        >
          {title.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
