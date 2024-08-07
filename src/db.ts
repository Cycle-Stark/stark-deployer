// db.ts
import Dexie, { Table } from 'dexie';

export interface Contract {
  id?: number
  name: string
  tx_info: Object
  date: string
  chainId: string
  contract_address: string
  abi?: Object
}

export interface FunctionCall{
  contract_address: string
  function_name: string
  calldata: any
  status: string
  result?: any
  error?: any
}

export interface INote{
  id?: number
  note: string
  title: string
}

export class StarkDeployerDexie extends Dexie {
  contracts!: Table<Contract>
  function_calls!: Table<FunctionCall>
  devnet_contracts!: Table<Contract>
  devnet_function_calls!: Table<FunctionCall>
  notes!: Table<INote>

  constructor() {
    super('starkDeployerDb1');
    this.version(1).stores({
      contracts: '++id, name, function_name, contract_address, chainId', // Primary key and indexed props
      function_calls: '++id, function_name, contract_address', // Primary key and indexed props
      devnet_contracts: '++id, name, contract_address',
      devnet_function_calls:  '++id, function_name, contract_address',
      notes:  '++id, note, title',
    });
  }
}

export const db = new StarkDeployerDexie();