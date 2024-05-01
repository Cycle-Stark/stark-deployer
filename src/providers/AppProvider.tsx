import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { connect, disconnect } from 'starknetkit'
import { modals } from '@mantine/modals'
import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useSnapshot } from 'valtio'
import appState from '../configs/storage'
import { bigintToShortStr } from '../configs/utils'
import { RpcProvider } from 'starknet'
import { showNotification } from '@mantine/notifications'

const initialData = {
    provider: null as any,
    switchNetwork: null as any,
    account: null as any,
    address: null as any,
    chainId: null as any,
    connectedWallet: null as any,
    connection: null as any,
    handleConnetWalletBtnClick: null as any,
    isSmallScreen: false,
}

export const AppContext = createContext(initialData)

export const useAppContext = () => {
    return useContext(AppContext)
}

interface IAppProvider {
    children: ReactNode
}

const AppProvider = ({ children }: IAppProvider) => {
    // Account

    const [provider, setProvider] = useState<null | any>()
    const [chainId, setChainId] = useState<null | string>('SN_SEPOLIA')
    const [connectedWallet, setConnectedWallet] = useState<any>(null)
    const [connection, setConnection] = useState<null | any>();
    const [account, setAccount] = useState<null | any>();
    const [address, setAddress] = useState<null | any>("");
    const [isSmallScreen, setIsSmallScreen] = useState<boolean | any>(false)

    const [opened, { open, close }] = useDisclosure(false);

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/[a-zA-Z0-9-_.~!*'();:@&=+$,%#]+)*\/?$/;

    const matches = useMediaQuery('(max-width: 768px)');
    const snap = useSnapshot(appState, { sync: true })

    const form = useForm({
        initialValues: {
            rpc_mainnet: snap.mainnetRPCEndpoint,
            rpc_sepolia: snap.sepoliaRPCEndpoint
        },
        validate: {
            rpc_mainnet: value => {
                if (value === '' || value === null) {
                    return "Mainnet RPC endpoint is required!"
                }
                else if (!urlRegex.test(value)) {
                    return "Enter valid URL!"
                }
                return null
            },
            rpc_sepolia: value => {
                if (value === '' || value === null) {
                    return "Sepolia RPC endpoint is required!"
                }
                else if (!urlRegex.test(value)) {
                    return "Enter valid URL!"
                }
                return null
            }
        }
    })


    const connectWallet = async () => {
        if (!form.values.rpc_mainnet || !form.values.rpc_sepolia) {
            showNotification({
                message: "RPC endpoints required for connection."
            })
            return
        }


        let RPC_ENDPOINT = form.values.rpc_mainnet
        if (chainId === 'SN_SEPOLIA') {
            RPC_ENDPOINT = form.values.rpc_sepolia
        }

        const provider = new RpcProvider({ nodeUrl: RPC_ENDPOINT })

        const connection: any = await connect({
            webWalletUrl: "https://web.argent.xyz",
            dappName: "Stark Deployer",
            modalMode: 'canAsk',
            provider: provider
        });

        if (connection && connection?.wallet?.isConnected) {
            setConnectedWallet(connection?.wallet?.id)
            setConnection(connection);
            setAccount(connection?.wallet?.account);
            setAddress(connection?.wallet?.selectedAddress);
            setProvider(provider)

            appState.mainnetRPCEndpoint = form.values.rpc_mainnet
            appState.sepoliaRPCEndpoint = form.values.rpc_sepolia

            const chainID_FROM_PROVIDER = bigintToShortStr(connection?.wallet?.provider?.chainId)

            if (connection?.wallet?.id === 'argentX') {
                const chainID_FROM_WALLET_CONNECTION = connection?.wallet?.chainId

                if (chainID_FROM_PROVIDER !== chainID_FROM_WALLET_CONNECTION) {
                    showNotification({
                        message: `Network mismatch. You have selected ${chainId} but your wallet is at ${chainID_FROM_WALLET_CONNECTION}. Change wallet network and reconnect please.`,

                    })
                    disconnectWallet()
                }
            } else {
                const readChainIdHexForBraavos = bigintToShortStr(connection?.wallet?.chainId)
                const chainID_FROM_WALLET_CONNECTION = readChainIdHexForBraavos === "SN_MAIN" ? "SN_MAIN" : "SN_SEPOLIA"

                if (chainID_FROM_PROVIDER !== chainID_FROM_WALLET_CONNECTION) {
                    showNotification({
                        message: `Network mismatch. You have selected ${chainId} but your wallet is at ${chainID_FROM_WALLET_CONNECTION}. Change wallet network and reconnect please.`
                    })
                    disconnectWallet()
                }
            }
        }
        close()
    };

    async function switchNetwork(connection: any, chainId: "SN_MAIN" | "SN_SEPOLIA" = "SN_SEPOLIA") {
        if (connectedWallet && connectedWallet === "braavos") {
            alert(`You have connected braavos. Please manually switch your wallet to ${chainId === 'SN_SEPOLIA' ? 'Mainnet' : 'Sepolia'} and reconnect your wallet`);
            disconnectWallet()
            return
        }
        setChainId(chainId)
        appState.activeChainId = chainId
        if (connection) {
            try {
                if (window.starknet) {
                    window.starknet?.request({
                        type: "wallet_switchStarknetChain",
                        params: {
                            chainId: chainId
                        }
                    }).then(() => {
                        // setChainId(chainId)
                        disconnectWallet()
                        // connectWallet()
                    })
                }

            } catch (error) {
                if (connectedWallet === "braavos") {
                    alert(`You have connected braavos. Please manually switch your wallet to ${chainId === 'SN_SEPOLIA' ? 'Mainnet' : 'Sepolia'} and reconnect your wallet`);
                    disconnectWallet()
                }
            }
        }
    }

    const disconnectWallet = async () => {
        await disconnect({ clearLastWallet: false });
        setConnection(null);
        setAccount(null);
        setAddress("");
        setProvider(null)
        // setChainId("")
        setConnectedWallet("")
    };


    const openConfirmDisconnectModal = () => modals.openConfirmModal({
        title: 'You are about to disconnet your wallet!',
        centered: true,
        radius: "md",
        children: (
            <Text size="sm">
                Are you sure you want to disconnect your account?
            </Text>
        ),
        labels: { confirm: 'Disconnect', cancel: 'Cancel' },
        confirmProps: { radius: "md", variant: "light" },
        cancelProps: { radius: "md", variant: "light" },
        onCancel: () => { },
        onConfirm: () => disconnectWallet(),
    });

    const handleConnetWalletBtnClick = () => {
        if (!account) {
            open()
            // connectWallet()
        }
        else {
            openConfirmDisconnectModal()
        }
    }

    const contextValue = useMemo(() => ({
        switchNetwork,
        chainId,
        connectedWallet,
        provider,
        account,
        address,
        connection,
        handleConnetWalletBtnClick,
        isSmallScreen,
    }), [account, address, connection, chainId, matches]);

    useEffect(() => {
        connectWallet();
    }, [chainId]);

    useEffect(() => {
        setIsSmallScreen(matches)
    }, [matches])

    useEffect(() => {
        setChainId(snap.activeChainId ?? 'SN_SEPOLIA')
    }, [])

    return (
        <AppContext.Provider value={contextValue}>
            {children}
            <Modal radius={'md'} opened={opened} onClose={close} size="lg" title="Connect with RPC">
                {/* <Text></Text> */}
                <form onSubmit={form.onSubmit(_values => connectWallet())} action='/some other page'>
                    <Stack>
                        <TextInput radius={'md'} label="Mainnet RPC Endpoint" placeholder='Enter Infura or Alchemy RPC Endpoint ie https://...' {...form.getInputProps('rpc_mainnet')} />
                        <TextInput radius={'md'} label="Sepolia RPC Endpoint" placeholder='Enter Infura or Alchemy RPC Endpoint ie https://...' {...form.getInputProps('rpc_sepolia')} />
                        <Box>
                            <Button radius={'md'} type='submit'>Connect</Button>
                        </Box>
                    </Stack>
                </form>
            </Modal>
        </AppContext.Provider>
    )
}

export default AppProvider


