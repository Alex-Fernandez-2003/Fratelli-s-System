export type TokenResponse = { accessToken: string }

/** Owns the access token exclusively in process memory. */
export function createSessionCoordinator() {
  let accessToken: string | undefined
  let epoch = 0
  let refreshPromise: Promise<TokenResponse> | undefined

  const accept = <T extends TokenResponse>(response: T, expectedEpoch = epoch): T => {
    if (expectedEpoch === epoch) accessToken = response.accessToken
    return response
  }

  return {
    getAccessToken: () => accessToken,
    getEpoch: () => epoch,
    accept,
    clear: () => {
      epoch += 1
      accessToken = undefined
      return epoch
    },
    refresh: <T extends TokenResponse>(operation: () => Promise<T>): Promise<T> => {
      if (!refreshPromise) {
        const startEpoch = epoch
        refreshPromise = operation()
          .then((response) => accept(response, startEpoch))
          .finally(() => {
            refreshPromise = undefined
          })
      }
      return refreshPromise as Promise<T>
    },
  }
}

export const sessionCoordinator = createSessionCoordinator()
