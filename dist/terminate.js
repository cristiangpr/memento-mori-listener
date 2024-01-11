"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminate = void 0;
const terminate = (server, options = { coredump: false, timeout: 500 }) => {
    // Exit function
    const exit = (code) => {
        return options.coredump ? process.abort() : process.exit(code);
    };
    return (code, reason) => (err, promise) => {
        if ((Boolean(err)) && err instanceof Error) {
            // Log error information, use a proper logging library here :)
            console.log(err.message, err.stack);
        }
        // Attempt a graceful shutdown
        server.close(exit);
        setTimeout(exit, options.timeout);
    };
};
exports.terminate = terminate;
//# sourceMappingURL=terminate.js.map