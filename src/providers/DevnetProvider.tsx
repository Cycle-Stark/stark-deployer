import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { Account, RpcProvider } from 'starknet'
import axios from 'axios'
import { RPC_ENDPOINT } from '../configs/config'
import { showNotification } from '@mantine/notifications'
import { IconAlertTriangle } from '@tabler/icons-react'

const initialData = {
    provider: null as any,
    account: null as any,
    accounts: null as any,
    address: null as any,
    isSmallScreen: false,
    devnetServerStatus: false,
    connectAccount: null as any,
}

export const DevnetContext = createContext(initialData)

export const useDevnetContext = () => {
    return useContext(DevnetContext)
}

interface IDevnetProvider {
    children: ReactNode
}

const DevnetProvider = ({ children }: IDevnetProvider) => {
    const [provider, setProvider] = useState<null | any>()
    const [account, setAccount] = useState<null | any>();
    const [address, setAddress] = useState<null | any>("");
    const [isSmallScreen, setIsSmallScreen] = useState<boolean | any>(false)
    const [devnetServerStatus, setDevnetServerStatus] = useState(true)

    const [accounts, setAccounts] = useState<any>([])

    // const [opened, { close, open }] = useDisclosure(false);

    // const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/[a-zA-Z0-9-_.~!*'();:@&=+$,%#]+)*\/?$/;

    const matches = useMediaQuery('(max-width: 768px)');
    // const snap = useSnapshot(appState, { sync: true })


    const connectAccount = async (index?: number) => {
        if (accounts?.length > 0) {
            const acc = accounts[index ?? 0]
            const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc", })
            const account = new Account(provider, acc?.address, acc?.private_key)

            setProvider(provider)
            setAccount(account);
            setAddress(acc?.address);
        }
    };


    const contextValue = useMemo(() => ({
        provider,
        account,
        address,
        isSmallScreen,
        accounts,
        devnetServerStatus,
        connectAccount
    }), [account, address, matches]);

    const loadAccounts = () => {
        axios.get(`${RPC_ENDPOINT}/predeployed_accounts`).then((res) => {
            setAccounts(res?.data)
        }).catch((_err: any) => {
            showNotification({
                title: "Loading accounts",
                message: "Unable to load accounts from devnet",
                color: "red",
                icon: <IconAlertTriangle />
            })
        })
    }

    const checkStatus = async () => {
        try {
            const res = await axios.request(
                {
                    url: 'http://localhost:5050/is_alive',
                    method: 'GET',
                }
            )
            if (res?.status === 200) {
                setDevnetServerStatus(true)
            }
        } catch (error) {
            setDevnetServerStatus(false)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [])

    useEffect(() => {
        loadAccounts()
    }, [devnetServerStatus])

    useEffect(() => {
        connectAccount();
    }, [accounts]);

    useEffect(() => {
        setIsSmallScreen(matches)
    }, [matches])

    return (
        <DevnetContext.Provider value={contextValue}>
            {children}
        </DevnetContext.Provider>
    )
}

export default DevnetProvider