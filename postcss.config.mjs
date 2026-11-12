// Tailwind CSS runs through PostCSS so both bundlers (webpack for production
// builds, Turbopack for `next dev`) pick it up the same way.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
