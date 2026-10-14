

import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";


const PORT = config.PORT || 5000;

; (async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
})();