import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react"
import { Contract } from "starknet"
import { db } from "../db"
import { useParams } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { useDevnetContext } from "./DevnetProvider"


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
    contract_id: null as any
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

    const _deployment = useLiveQuery(() => db.devnet_contracts.get(Number(contract_id ?? '0')));

    const makeContractConnection = () => {
        if (account && deployment?.abi) {
            const contract = new Contract(deployment?.abi?.abi, deployment?.contract_address, account)
            setContract(contract)
            setCtx(cur => ({ ...cur, contract_address: deployment?.contract_address }))
        }
    }

    const loadAbi = () => {
        // const id: any = contract_id
        // axios.get(`${URLS.abi_endpoint}/${deployment?.contract_address}`).then((res: any) => {
        //     db.contracts.update(Number(id), { abi: res?.data }).then((_res: any) => {
        //         showNotification({
        //             message: "Updated contract abi",
        //             color: "green",
        //             icon: <IconCheck />
        //         })
        //         window.location.reload()
        //     }).catch((err: any) => {
        //         console.error("error", err)
        //     })
        // }).catch(() => { })
    }

    // const loadDeployment = () => {
    //     const id: any = contract_id
    //     db.contracts.get(Number(id)).then((res: any) => {
    //         setDeployment(res)
    //     }).catch(() => { })
    // }

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
        contract_id
    }), [contract_id, account, deployment, contract]);

    // useEffect(() => {
    //     if (!deployment) {
    //         loadDeployment()
    //     }
    // }, [contract_id])

    useEffect(() => {
        if (deployment && !deployment?.abi) {
            loadAbi()
        }
    }, [deployment])

    useEffect(() => {
        makeContractConnection()
    }, [account, contract_id, deployment])

    useEffect(() => {
        if (_deployment) {
            setDeployment(_deployment)
        }
    }, [_deployment])

    return (
        <DevnetContractContext.Provider value={contextValue}>
            {children}
        </DevnetContractContext.Provider>
    )
}

export default DevnetContractProvider