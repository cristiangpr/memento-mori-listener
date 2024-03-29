/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import express from 'express'
import { ethers, WebSocketProvider } from 'ethers'
import mmAbi from './abis/mementoMori.json'
import mmXAbi from './abis/mementoMoriXchain.json'
import { baseGChainSelector, baseGMmAddress, prodUrl, sepoliaChainSelector, sepoliaMmAddress } from './constants'
import { terminate } from './terminate'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
const app = express()
let port: string | number
if (process.env.PORT.length > 0) {
  port = process.env.PORT
} else {
  port = 80
}

async function main (): Promise<void> {
  const sepoliaProvider = new WebSocketProvider(process.env.SEPOLIA_WEB_SOCKET)
  const baseGProvider = new WebSocketProvider(process.env.BASE_GOERLI_WEB_SOCKET)

  const sepoliaContract = new ethers.Contract(sepoliaMmAddress, mmAbi, sepoliaProvider)
  const baseGContract = new ethers.Contract(baseGMmAddress, mmXAbi, baseGProvider)
  void sepoliaContract.on('WillExecuted', async (owner) => {
    let res: Response
    try {
      res = await fetch(
      `${prodUrl}?filters[baseAddress][$eq]=${owner}&filters[chainSelector][$eq]=${sepoliaChainSelector}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' }
      }
      )
    } catch {
      console.log('will not found')
    }
    const check = await res.json()

    console.log(check)
    let response: Response
    try {
      response = await fetch(`${prodUrl}/${check.data[0].id}`, {
        method: 'PUT',
        headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { isActive: false, executed: true } })
      })
    } catch {
      console.log('will not found')
    }
    console.log('sepolia will executed', response)
  })

  void baseGContract.on('WillExecuted', async (owner) => {
    let res: Response
    try {
      res = await fetch(
      `${prodUrl}?filters[baseAddress][$eq]=${owner}&filters[chainSelector][$eq]=${baseGChainSelector}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' }
      }
      )
    } catch {
      console.log('will not found')
    }
    const check = await res.json()

    console.log(check)
    let response: Response
    try {
      response = await fetch(`${prodUrl}/${check.data[0].id}`, {
        method: 'PUT',
        headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { isActive: false, executed: true } })
      })
    } catch {
      console.log('will not found')
    }
    console.log('base goerli will executed', response)
  })
}
void main()
app.get('/', (req, res) => {
  res.send('Memento Mori Listener')
})

const server = app.listen(port, () => {
  console.log(`Express is listening at ${port}`)
})

const exitHandler = terminate(server, {
  coredump: false,
  timeout: 500
})

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'))
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'))
process.on('SIGTERM', exitHandler(0, 'SIGTERM'))
process.on('SIGINT', exitHandler(0, 'SIGINT'))
