import 'dotenv/config';


const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    NODE_ENV:process.env.NODE_ENV,
    IMAGEKIT_PRICATE_KEY:process.env.IMAGEKIT_PRICATE_KEY,
};

export default config