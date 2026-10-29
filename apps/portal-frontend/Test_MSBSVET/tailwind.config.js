//module.exports = {
//  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
//  theme: {
//    extend: {
//      fontFamily: {
//        sans: ["Poppins", "sans-serif"],
//      },
//    },
//  },
//  plugins: [],
//};

module.exports = {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            keyframes: {
                'slide-in-right': {
                    '0%': {
                        transform: 'translateX(100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1'
                    }
                }
            },
            animation: {
                'slide-in-right': 'slide-in-right 0.5s ease-out'
            }
        }
    },
    variants: {},
    plugins: []
};
