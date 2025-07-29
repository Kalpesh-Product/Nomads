export const allowedOrigins = [
  "https://thebridg.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

export const corsConfig = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
