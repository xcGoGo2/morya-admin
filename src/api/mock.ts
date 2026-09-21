/** Simulate network latency for mock APIs. */
export function delay(ms = 420): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
