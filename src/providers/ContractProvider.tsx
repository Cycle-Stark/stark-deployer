import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react"
import { useAppContext } from "./AppProvider"
import { Contract, RpcProvider } from "starknet"
import { db } from "../db"
import { showNotification } from "@mantine/notifications"
import { IconCheck } from "@tabler/icons-react"
import { useParams } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"


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
    reLoadAbi: null as any,
}

interface IContractProvider {
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

export const ContractContext = createContext(initialData)
 
export const useContractContext = () => {
    return useContext(ContractContext)
}

interface IAppProvider {
    children: ReactNode
}

const ContractProvider = (props: IAppProvider) => {
    const { children } = props
    const { account } = useAppContext()
    const [ctx, setCtx] = useState<IContractProvider>(initialData)
    const { contract_id } = useParams()
    const [deployment, setDeployment] = useState<any | null>(null)
    const [contract, setContract] = useState<any | null>()
    const [opened, { close, open }] = useDisclosure(false);

    const _deployment = useLiveQuery(() => db.contracts.get(Number(contract_id ?? '0')));
    // console.log(deployment)
    const form = useForm({
        initialValues: {
            endpoint: ''
        },
        validate: {
            endpoint: val => val === '' || val?.length < 5 ? 'Please enter valid endpoint' : null
        }
    })

    const makeContractConnection = () => {
        if (account && deployment?.abi) {
            const contract = new Contract(deployment?.abi?.abi, deployment?.contract_address, account)
            setContract(contract)
            setCtx(cur => ({ ...cur, contract_address: deployment?.contract_address }))
        }
    }

    const handleLoadABI = async () => {
        const provider = new RpcProvider({ nodeUrl: form.values.endpoint, retries: 200, });
        if (provider) {
            const new_abi = await provider.getClassAt(deployment?.contract_address)
            const id: any = contract_id
            db.contracts.update(Number(id), { abi: new_abi }).then((_res: any) => {
                showNotification({
                    message: "Updated contract abi",
                    color: "green",
                    icon: <IconCheck />
                })
                window.location.reload()
            }).catch((err: any) => {
                showNotification({
                    title: 'Unable to reload abi',
                    message: `${err}`,
                    color: 'red'
                })
            })
        }
    }



    const reLoadAbi = () => {
        open()
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
        reLoadAbi,
        contract_id
    }), [contract_id, account, deployment, contract]);

    useEffect(() => {
        if (deployment && !deployment?.abi) {
            reLoadAbi()
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
        <ContractContext.Provider value={contextValue}>
            {children}
            <Modal opened={opened} onClose={close} radius={'md'} title="Reload contract ABI">
                <form onSubmit={form.onSubmit(_values => handleLoadABI())}>
                    <Stack gap={10}>
                        <TextInput label="RPC Endpoint" {...form.getInputProps('endpoint')} placeholder="https://starknet-goerli..." />
                        <Group justify="center">
                            <Button type="submit" radius={'md'}>Reload</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </ContractContext.Provider>
    )
}

export default ContractProvider

