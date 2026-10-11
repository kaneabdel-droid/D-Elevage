// Supabase-js classe ses propres échecs réseau transitoires sous des erreurs
// nommées "Retryable" (AuthRetryableFetchError côté auth, comportement analogue
// côté PostgREST). withRetry permet de sécuriser les appels en environnement serverless Vercel.
export async function withRetry<T>(fn: () => PromiseLike<T>, attempts = 3, delayMs = 300): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
  throw lastError
}

export async function withRetryResult<R extends { data: unknown; error: { message: string } | null }>(
  fn: () => PromiseLike<R>,
  attempts = 3,
  delayMs = 300
): Promise<R | { data: null; error: { message: string } }> {
  try {
    return await withRetry(fn, attempts, delayMs)
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : String(error) } }
  }
}
