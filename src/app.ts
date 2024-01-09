/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import express from 'express'
import { ethers, WebSocketProvider } from 'ethers'
import mmAbi from './abis/mementoMori.json'
import mmXAbi from './abis/mementoMoriXchain.json'
import { baseGChainSelector, baseGMmAddress, prodUrl, sepoliaChainSelector, sepoliaMmAddress } from './constants'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
const app = express()
const port = 8000

async function main (): Promise<void> {
  const sepoliaProvider = new WebSocketProvider(process.env.SEPOLIA_WEB_SOCKET)
  const baseGProvider = new WebSocketProvider(process.env.BASE_GOERLI_WEB_SOCKET)

  const sepoliaContract = new ethers.Contract(sepoliaMmAddress, mmAbi, sepoliaProvider)
  const baseGContract = new ethers.Contract(baseGMmAddress, mmXAbi, baseGProvider)
  sepoliaContract.on('WillExecuted', async (owner) => {
    let res
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
    let response
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

  baseGContract.on('WillExecuted', async (owner) => {
    let res
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
    let response
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

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`)
})