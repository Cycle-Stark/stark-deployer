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

export class StarkDeployerDexie extends Dexie {
  contracts!: Table<Contract>
  function_calls!: Table<FunctionCall>
  devnet_contracts!: Table<Contract>
  devnet_function_calls!: Table<FunctionCall>

  constructor() {
    super('starkDeployerDb');
    this.version(1).stores({
      contracts: '++id, name, contract_address' // Primary key and indexed props
    });
    this.version(2).stores({
      function_calls: '++id, function_name, contract_address' // Primary key and indexed props
    });
    this.version(3).stores({
      function_calls: '++id, [contract_address+function_name], function_name, contract_address' // Primary key and indexed props
    });
    this.version(4).stores({
      devnet_contracts: '++id'
    });
    this.version(5).stores({
      devnet_contracts: '++id, name, contract_address'
    });
    this.version(6).stores({
      devnet_function_calls:  '++id, [contract_address+function_name], function_name, contract_address'
    });
  }
}

export const db = new StarkDeployerDexie();