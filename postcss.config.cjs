/* PostCSS v8 + Tailwind 4 */
module.exports = {
    plugins: [
      // tells PostCSS to hand class scanning/compilation off to Tailwind
      require('@tailwindcss/postcss')({
        // if you decide to rename/move the config file, update this path
        config: './tailwind.config.ts',
      }),
      // vendor-prefixes modern CSS for older browsers when you `vite build`
      require('autoprefixer'),
    ],
  };
  