const config = {
  dev: {
    api: "http://222.214.219.202:4401/",
  },
  prod: {
    api: "https://api.gmking.io/"
  },
};

export default {
  ENV: import.meta.env.NODE_ENV,
  ...config[import.meta.env.MODE as keyof typeof config],
};