const config = {
  dev: {
    api: "https://test2.xlab.red:4401/",
  },
  test: {
    api: "https://test2.xlab.red:4401/",
  },
  prod: {
    api: "https://api.gmking.io/"
  },
};

export default {
  ENV: import.meta.env.NODE_ENV,
  ...config[import.meta.env.VITE_SERVER_CONFIG as keyof typeof config],
};