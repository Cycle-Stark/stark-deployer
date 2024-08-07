import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react"
import { Contract, RpcProvider } from "starknet"
import { db } from "../db"
import { useParams } from "react-router-dom"
import { useDevnetContext } from "./DevnetProvider"
import { showNotification } from "@mantine/notifications"
import { IconCheck } from "@tabler/icons-react"


const initialData = {
    contract: null as any,
    contract_address: null as any,
    chainId: null as any,
    deployment: null as any,
    interfaces: null as any,
    functions: null as any,
    extra_functions: null as any,
    get_function_info: null as any,
    connectContract: null as any,
    contract_id: null as any,
    reloadAbi: null as any,
}

interface IDevnetContractProvider {
    contract: any
    contract_address: any
    chainId: string
    deployment: any
    interfaces: any
    functions: any
    extra_functions: any
    get_function_info: any
    connectContract: any
    contract_id: any
    reloadAbi: any
}

export const DevnetContractContext = createContext(initialData)

export const useDevnetContractContext = () => {
    return useContext(DevnetContractContext)
}

interface IAppProvider {
    children: ReactNode
}

const DevnetContractProvider = (props: IAppProvider) => {
    const { children } = props
    const [ctx, setCtx] = useState<IDevnetContractProvider>(initialData)
    const { contract_id } = useParams()
    const [deployment, setDeployment] = useState<any | null>(null)
    const [contract, setContract] = useState<any | null>()

    const { account } = useDevnetContext()

    // const _deployment = useLiveQuery(() => db.devnet_contracts.get(Number(contract_id ?? '0')));

    const makeContractConnection = () => {
        if (account && deployment?.abi) {
            const contract = new Contract(deployment?.abi?.abi, deployment?.contract_address, account)
            setContract(contract)
            setCtx(cur => ({ ...cur, contract_address: deployment?.contract_address }))
        }
    }

    const handleLoadABI = async () => {
        const provider = new RpcProvider({ nodeUrl: "http://localhost:5050/rpc", retries: 200, });
        if (provider) {
            const new_abi = await provider.getClassAt(deployment?.contract_address)
            const id: any = contract_id
            console.log("Reloaded abi: ", new_abi)

            db.devnet_contracts.update(Number(id), { abi: new_abi }).then((_res: any) => {
                showNotification({
                    message: "Updated contract abi",
                    color: "green",
                    icon: <IconCheck />
                })
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }).catch((err: any) => {
                showNotification({
                    title: 'Unable to reload abi',
                    message: `${err}`,
                    color: 'red'
                })
            })
        }
    }

    const loadDeployment = () => {
        const id: any = contract_id
        db.devnet_contracts.get(Number(id)).then((res: any) => {
            setDeployment(res)
        }).catch(() => { })
    }

    const getInterfaces = () => {
        const interfaces = deployment?.abi?.abi?.filter((item: any) => item?.type === 'interface') ?? []
        return interfaces
    }

    const getAllFunctions = () => {
        let funcs: any = []
        deployment?.abi?.abi?.map((item: any) => {
            if (item?.type === 'interface') {
                funcs = funcs.concat(item?.items)
            }
            else if (item?.type === 'function') {
                funcs.push(item)
            }
        })
        return funcs
    }

    const getExtraFunctions = () => {
        return deployment?.abi?.abi?.filter((item: any) => item?.type === 'function')
    }

    const getFunctionInfo = (func_name: string) => {
        return getAllFunctions()?.find((fc: any) => fc?.name === func_name)
    }

    const contextValue = useMemo(() => ({
        ...ctx,
        deployment,
        contract: contract,
        interfaces: getInterfaces(),
        functions: getAllFunctions(),
        extra_functions: getExtraFunctions(),
        get_function_info: getFunctionInfo,
        connectContract: makeContractConnection,
        contract_id,
        reloadAbi: handleLoadABI
    }), [contract_id, account, deployment, contract]);

    useEffect(() => {
        makeContractConnection()
    }, [account, deployment])

    useEffect(() => {
        loadDeployment()
    }, [contract_id])

    return (
        <DevnetContractContext.Provider value={contextValue}>
            {children}
        </DevnetContractContext.Provider>
    )
}

export default DevnetContractProvider