export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://wono.co",
  "https://www.wono.co",
  "https://wononomadsfe.vercel.app",
  "https://wonomasterfe.vercel.app",
  "https://wonomasterbe.vercel.app",
  "https://data-upload-alpha.vercel.app",
];

const regexAllowedOrigins = [
  /\.wono\.co$/, // allow any subdomain of wono.co
  /\.localhost:5173$/, // allow any subdomain of localhost:5173 (for Vite dev tenant sites)
];

export const corsConfig = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser / curl / server-side requests

    if (
      allowedOrigins.includes(origin) ||
      regexAllowedOrigins.some((regex) => regex.test(origin)) ||
      !origin
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // important if you use cookies/sessions
  optionsSuccessStatus: 200,
};
