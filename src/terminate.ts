export const terminate = (server, options = { coredump: false, timeout: 500 }): (code: number, reason: any) => (err: any, promise: any) => void => {
  // Exit function
  const exit = (code: number): (code: number, reason: any) => (err: any, promise: any) => void => {
    return options.coredump ? process.abort() : process.exit(code)
  }

  return (code, reason) => (err, promise) => {
    if ((Boolean(err)) && err instanceof Error) {
    // Log error information, use a proper logging library here :)
      console.log(err.message, err.stack)
    }

    // Attempt a graceful shutdown
    server.close(exit)
    setTimeout(exit, options.timeout)
  }
}
