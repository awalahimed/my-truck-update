export async function retryAsync(fn, attempts = 3, initialDelayMs = 1000) {
    let lastError = null;
    let delay = initialDelayMs;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            if (i < attempts - 1) {
                await new Promise((res) => setTimeout(res, delay));
                delay *= 2;
            }
        }
    }
    throw lastError;
}
export default retryAsync;
//# sourceMappingURL=retry.js.map