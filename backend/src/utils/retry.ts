export async function retryAsync<T>(fn: () => Promise<T>, attempts = 3, initialDelayMs = 1000): Promise<T> {
  let lastError: any = null
  let delay = initialDelayMs
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) {
        await new Promise((res) => setTimeout(res, delay))
        delay *= 2
      }
    }
  }
  throw lastError
}

export default retryAsync
