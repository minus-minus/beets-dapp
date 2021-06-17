// pulled from https://github.com/EulerBeats/eulerbeats-cli/blob/96f2a6eef8879af2585f296e2a66db37436b0cae/src/utils/constants.ts

import { invert } from "lodash"

export const GENESIS_TOKEN_CONTRACT_ADDRESS = '0x8754F54074400CE745a7CEddC928FB1b7E985eD6'
export const GENESIS_PRINTING_PRESS_ADDRESS = '0x8Cac485c30641ece09dBeB2b5245E24dE4830F27'
export const ENIGMA_TOKEN_CONTRACT_ADDRESS = '0xa98771a46Dcb34B34cDAD5355718F8a97C8E603e'

export const GENESIS_TRACK_TO_TOKEN_ID = {
  '01': '21575894274',
  '02': '18052613891',
  '03': '12918588162',
  '04': '21760049923',
  '05': '22180136451',
  '06': '8926004995',
  '07': '22364095747',
  '08': '17784178691',
  '09': '554240256',
  '10': '17465084160',
  '11': '13825083651',
  '12': '12935627264',
  '13': '8925938433',
  '14': '4933026051',
  '15': '8673888000',
  '16': '13439075074',
  '17': '13371638787',
  '18': '17750625027',
  '19': '21592343040',
  '20': '4916052483',
  '21': '4395697411',
  '22': '13556253699',
  '23': '470419715',
  '24': '17800760067',
  '25': '9193916675',
  '26': '9395767298',
  '27': '22314157057',
}

export const GENESIS_TOKEN_ID_TO_TRACK = invert(GENESIS_TRACK_TO_TOKEN_ID)

export const GENESIS_DEPLOY_BLOCK = 11850423
export const ENIGMA_DEPLOY_BLOCK = 12103580

export const ENIGMA_TRACK_TO_TOKEN_ID = {
  '01': '2237778887424',
  '02': '120376721408',
  '03': '1254198018048',
  '04': '1228495585536',
  '05': '1331490521856',
  '06': '1340164079616',
  '07': '1112564629760',
  '08': '4535620207104',
  '09': '1305787958016',
  '10': '64458063872',
  '11': '1267032129536',
  '12': '1241246203904',
  '13': '3444614299648',
  '14': '1327145222656',
  '15': '1207020683776',
  '16': '2327906091520',
  '17': '1125432951552',
  '18': '1297180984064',
  '19': '1331557565184',
  '20': '1348636967680',
  '21': '3478923837440',
  '22': '1099529126656',
  '23': '146197118976',
  '24': '4432574481152',
  '25': '244847083776',
  '26': '1280018153728',
  '27': '4398080131840',
}

export const ENIGMA_TOKEN_ID_TO_TRACK = invert(ENIGMA_TRACK_TO_TOKEN_ID)

export const eventTopics = {
  TransferSingle: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  TransferBatch: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
  MintOriginal: '0xe4f0f5c21ed48cb2fc51c9d879699cdb5bc1c00eb8804ee42d80f4c396a706b5',
  PrintMinted: '0x4251d75749ad140eadaa466a69c53451f36b41cc82640aa2a74327b0039b8e6c',
  PrintBurned: '0x28c10a3ed4dd25f5f55dfd6c310c0e429c49e5e360db37f0cb3dbef72343e80f',
}