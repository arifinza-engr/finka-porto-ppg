tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: "#17324D",
        forest: "#3F6B57",
        mustard: "#E3A72F",
        terracotta: "#C85A3F",
        cream: "#F5E8D0",
        rust: "#8B4535",
      },
      fontFamily: {
        serif: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "3d-sm": "2px 2px 0px #17324D",
        "3d-md": "4px 4px 0px #17324D",
        "3d-lg":
          "8px 8px 0px #17324D, 12px 12px 15px rgba(23, 50, 77, 0.15)",
        "3d-mustard": "4px 4px 0px #E3A72F",
        "3d-forest": "4px 4px 0px #3F6B57",
        "3d-terracotta": "4px 4px 0px #C85A3F",
        paper:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
};
