import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/home'
import NotFound from './pages/not-found'
import Deploy from "./pages/deploy";
import Interact from "./pages/contract/interact";
import { ContractLayout } from "./layouts/contracts/ContractLayout";
import FunctionPage from "./pages/contract/FunctionPage";
import Abi from "./pages/contract/Abi";
import ContractDashboard from "./pages/contract/ContractDashboard";
import ContractTransactions from "./pages/contract/ContractTransactions";
import Devnet from "./pages/devnet/Devnet";
import DevnetLayout from "./layouts/DevnetLayout";
import Accounts from "./pages/devnet/Accounts";
import DeployedContracts from "./pages/devnet/DeployedContracts";
import DeployContract from "./pages/devnet/DeployContract";
import { DevnetContractLayout } from "./layouts/contracts/DevnetContractLayout";
import CustomMantineProvider from "./layouts/CustomMantineProvider";
import DevnetContractDashboard from "./pages/devnet/contract/DevnetContractDashboard";
import DevnetContractTransactions from "./pages/devnet/contract/DevnetContractTransactions";
import DevnetContractAbi from "./pages/devnet/contract/DevnetContractAbi";
import DevnetFunctionPage from "./pages/devnet/contract/DevnetFunctionPage";
import DevnetDashboard from "./pages/devnet/DevnetDashboard";

import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/code-highlight/styles.css';
import "./styles/main.css"

import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';
import ImportContract from './pages/importContract';
import Contracts from './pages/contracts';

function App() {

  // function initDevnetRs() {
  //   invoke('greet', { path: "/home/dalmas/E/blockchain/starknet/devnet-rs/starknet-devnet-rs" })
  //     .then((response: any) => setRes(response))
  // }

  // function contractBuild() {
  //   invoke('build', { path: "/home/dalmas/E/blockchain/starknet/projects/cycle-stark/contract" })
  //     .then((response: any) => setRes(response))
  // }

  // useEffect(() => {
  //   initDevnetRs()
  //   contractBuild()
  // }, [])

  return (
    <>
      <CustomMantineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><Home /> </MainLayout>} />
            <Route path="/deploy" element={<MainLayout><Deploy /></MainLayout>} />
            <Route path="/contracts" element={<MainLayout><Contracts /></MainLayout>} />
            <Route path="/import" element={<MainLayout><ImportContract /></MainLayout>} />

            <Route path="/contracts/interact/:contract_id/" element={<ContractLayout> <Interact /> </ContractLayout>} >
              <Route path="/contracts/interact/:contract_id/" element={<ContractDashboard />} />
              <Route path="/contracts/interact/:contract_id/transactions" element={<ContractTransactions />} />
              <Route path="/contracts/interact/:contract_id/abi" element={<Abi />} />
              <Route path="/contracts/interact/:contract_id/functions/:function_name" element={<FunctionPage />} />
            </Route>
            <Route path="/devnet" element={<DevnetLayout><Devnet /></DevnetLayout>} >
              <Route path="/devnet/" element={<DevnetDashboard />} />
              <Route path="/devnet/contracts" element={<Outlet />}>
                <Route path="/devnet/contracts" element={<DeployedContracts />} />
                <Route path="/devnet/contracts/interact/:contract_id/" element={<DevnetContractLayout><Outlet /></DevnetContractLayout>}>
                  <Route path="/devnet/contracts/interact/:contract_id/dashboard" element={<DevnetContractDashboard />} />
                  <Route path="/devnet/contracts/interact/:contract_id/transactions" element={<DevnetContractTransactions />} />
                  <Route path="/devnet/contracts/interact/:contract_id/abi" element={<DevnetContractAbi />} />
                  <Route path="/devnet/contracts/interact/:contract_id/functions/:function_name" element={<DevnetFunctionPage />} />
                </Route>
              </Route>
              <Route path="/devnet/deploy" element={<DeployContract />} />
              <Route path="/devnet/accounts" element={<Accounts />} />
              <Route path="/devnet/settings" element={<Devnet />} />
            </Route>
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      </CustomMantineProvider>
    </>
  )
}

export default App

