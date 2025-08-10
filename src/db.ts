// db.ts
import Dexie, { type EntityTable } from 'dexie';

interface Contract {
  id: number;
  name: string;
  tx_info: Object;
  date: string;
  chainId: string;
  contract_address: string;
  abi?: Object;
}

interface FunctionCall {
  id: number;
  contract_address: string;
  function_name: string;
  calldata: any;
  status: string;
  result?: any;
  error?: any;
}

interface INote {
  id: number;
  note: string;
  title: string;
}

const db = new Dexie('starkDeployerDb1') as Dexie & {
  contracts: EntityTable<Contract, 'id'>;
  function_calls: EntityTable<FunctionCall, 'id'>;
  devnet_contracts: EntityTable<Contract, 'id'>;
  devnet_function_calls: EntityTable<FunctionCall, 'id'>;
  notes: EntityTable<INote, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  contracts: '++id, name, function_name, contract_address, chainId', // Primary key and indexed props
  function_calls: '++id, function_name, contract_address', // Primary key and indexed props
  devnet_contracts: '++id, name, contract_address',
  devnet_function_calls: '++id, function_name, contract_address',
  notes: '++id, note, title',
});

export type { Contract, FunctionCall, INote };
export { db };