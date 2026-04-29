export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#6C63FF',
        secondary: '#00D4AA',
        surface: '#1A1A2E',
        surface2: '#16213E',
        border: '#2A2A4A',
        bg: '#0F0F1A',
        text: '#FFFFFF',
        muted: '#A0AEC0',
        danger: '#FF4D6D',
        warning: '#FFB547',
        info: '#4DA6FF'
      },
      boxShadow: {
        card: '0 16px 40px rgba(0, 0, 0, 0.22)'
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '10px'
      }
    }
  },
  plugins: []
};
