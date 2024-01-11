export const terminate = (server, options = { coredump: false, timeout: 500 }): (code: number, reason: any) => (err: any, promise: any) => void => {
  const exit = (code: number): (code: number, reason: any) => (err: any, promise: any) => void => {
    return options.coredump ? process.abort() : process.exit(code)
  }

  return (code, reason) => (err, promise) => {
    if ((Boolean(err)) && err instanceof Error) {
      console.log(err.message, err.stack)
    }

    server.close(exit)
    setTimeout(exit, options.timeout)
  }
}
