module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New warm, kid-friendly palette
        brand: {
          orange: '#FF9F1C',
          green: '#2EC4B6',
          purple: '#9B5DE5',
        },
        accent: {
          yellow: '#FFD23F',
          pink: '#FF99AC',
          blue: '#3A86FF',
        },
        cream: '#FFF8F0',
        // Design token aliases (classnames like bg-primaryBlue, text-textNavy)
        primaryBlue: '#3A86FF',
        secondaryYellow: '#FFD23F',
        accentCoral: '#FF9F1C',
        supportMint: '#2EC4B6',
        supportLavender: '#9B5DE5',
        backgroundCream: '#FFF8F0',
        textNavy: '#14213D',
        // Keep previous to avoid breaking existing classes
        kurdish: {
          red: '#E31E24',
          white: '#FFFFFF',
          green: '#00A651',
          yellow: '#FFD700',
        },
      },
      fontFamily: {
        'kurdish': ['Noto Sans Kurdish', 'Arial', 'sans-serif'],
        'playful': ['Fredoka One', 'cursive'],
        'heading': ['Fredoka One', 'Nunito', 'Arial', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'Arial', 'sans-serif'],
        'fredoka': ['Fredoka One', 'cursive'],
        'nunito': ['Nunito', 'Arial', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      }
    },
  },
  plugins: [],
}

