// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          '0%':   { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'zoom-in': 'zoomIn 0.3s ease-out forwards',
      },
    },
  },
};