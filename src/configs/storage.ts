import { proxy, subscribe } from 'valtio'

const initialState = {
    rpcEndpoint: 'null',
    deployments: []
}

const appState = proxy(JSON.parse(localStorage.getItem('contract_deployer_state') ?? '{}') || initialState)

subscribe(appState, () => {
    localStorage.setItem('contract_deployer_state', JSON.stringify(appState))
})

export default appState