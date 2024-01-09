"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const mementoMori_json_1 = __importDefault(require("./abis/mementoMori.json"));
const mementoMoriXchain_json_1 = __importDefault(require("./abis/mementoMoriXchain.json"));
const constants_1 = require("./constants");
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
const app = (0, express_1.default)();
const port = 8000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const sepoliaProvider = new ethers_1.WebSocketProvider(process.env.SEPOLIA_WEB_SOCKET);
        const baseGProvider = new ethers_1.WebSocketProvider(process.env.BASE_GOERLI_WEB_SOCKET);
        const sepoliaContract = new ethers_1.ethers.Contract(constants_1.sepoliaMmAddress, mementoMori_json_1.default, sepoliaProvider);
        const baseGContract = new ethers_1.ethers.Contract(constants_1.baseGMmAddress, mementoMoriXchain_json_1.default, baseGProvider);
        sepoliaContract.on('WillExecuted', (owner) => __awaiter(this, void 0, void 0, function* () {
            let res;
            try {
                res = yield fetch(`${constants_1.prodUrl}?filters[baseAddress][$eq]=${owner}&filters[chainSelector][$eq]=${constants_1.sepoliaChainSelector}`, {
                    method: 'GET',
                    headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' }
                });
            }
            catch (_a) {
                console.log('will not found');
            }
            const check = yield res.json();
            console.log(check);
            let response;
            try {
                response = fetch(`${constants_1.prodUrl}/${check.data[0].id}`, {
                    method: 'PUT',
                    headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { isActive: false, executed: true } })
                });
            }
            catch (_b) {
                console.log('will not found');
            }
            console.log('sepolia will executed', response);
        }));
        baseGContract.on('WillExecuted', (owner) => __awaiter(this, void 0, void 0, function* () {
            let res;
            try {
                res = yield fetch(`${constants_1.prodUrl}?filters[baseAddress][$eq]=${owner}&filters[chainSelector][$eq]=${constants_1.baseGChainSelector}`, {
                    method: 'GET',
                    headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' }
                });
            }
            catch (_c) {
                console.log('will not found');
            }
            const check = yield res.json();
            console.log(check);
            let response;
            try {
                response = fetch(`${constants_1.prodUrl}/${check.data[0].id}`, {
                    method: 'PUT',
                    headers: { Authorization: `bearer ${process.env.STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { isActive: false, executed: true } })
                });
            }
            catch (_d) {
                console.log('will not found');
            }
            console.log('base goerli will executed', response);
        }));
    });
}
void main();
app.get('/', (req, res) => {
    res.send('Memento Mori Listener');
});
app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map