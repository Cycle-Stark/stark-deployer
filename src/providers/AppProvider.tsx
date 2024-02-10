import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { connect, disconnect } from 'starknetkit'
import { modals } from '@mantine/modals'
import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useSnapshot } from 'valtio'
import appState from '../configs/storage'

const initialData = {
    provider: null as any,
    switchNetwork: null as any,
    account: null as any,
    address: null as any,
    chainId: null as any,
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

    const [provider, setProvider] = useState<null | any>()
    const [chainId, setChainId] = useState<null | string>('SN_GOERLI')
    const [connection, setConnection] = useState<null | any>();
    const [account, setAccount] = useState<null | any>();
    const [address, setAddress] = useState<null | any>("");
    const [isSmallScreen, setIsSmallScreen] = useState<boolean | any>(false)
    const [opened, { close }] = useDisclosure(false);

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/[a-zA-Z0-9-_.~!*'();:@&=+$,%#]+)*\/?$/;

    const matches = useMediaQuery('(max-width: 768px)');
    const snap = useSnapshot(appState, { sync: true })

    const form = useForm({
        initialValues: {
            rpc: snap.rpcEndpoint
        },
        validate: {
            rpc: value => {
                if (value === '' || value === null) {
                    return "RPC endpoint is required!"
                }
                else if (!urlRegex.test(value)) {
                    return "Enter valid URL!"
                }
                return null
            }
        }
    })

    async function switchNetwork(connection: any, chainId: "SN_MAIN" | "SN_GOERLI" = "SN_GOERLI") {
        console.log(connection, chainId)
        if (connection) {
            try {
                if (window.starknet) {
                    await window.starknet.request({
                        type: "wallet_switchStarknetChain",
                        params: {
                            chainId: chainId
                        }
                    })
                    setChainId(chainId)
                }

            } catch (error) {
                console.log(error)
                alert("Please manually switch your wallet network to testnet and reload the page");
            }
        }
    }

    const connectWallet = async () => {
        const connection: any = await connect({
            webWalletUrl: "https://web.argent.xyz",
            dappName: "Stark Deployer",
            modalMode: 'alwaysAsk',
        });

        if (connection && connection?.wallet?.isConnected) {
            setConnection(connection);
            setAccount(connection?.wallet?.account);
            setAddress(connection?.wallet?.selectedAddress);
            appState.rpcEndpoint = form.values.rpc
        }
    };

    const disconnectWallet = async () => {
        await disconnect({ clearLastWallet: true });
        setConnection(null);
        setAccount(null);
        setAddress("");
        setProvider(null)
    };


    const openConfirmDisconnectModal = () => modals.openConfirmModal({
        title: 'Please confirm your action',
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
            // open()
            connectWallet()
        }
        else {
            openConfirmDisconnectModal()
        }
    }

    const contextValue = useMemo(() => ({
        switchNetwork,
        chainId,
        provider,
        account,
        address,
        connection,
        handleConnetWalletBtnClick,
        isSmallScreen,
    }), [account, address, connection, chainId, matches]);

    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        setIsSmallScreen(matches)
    }, [matches])

    return (
        <AppContext.Provider value={contextValue}>
            {children}
            <Modal radius={'md'} opened={opened} onClose={close} size="lg" title="Connect with RPC">
                <Text></Text>
                <form onSubmit={form.onSubmit(_values => connectWallet())}>
                    <Stack>
                        <TextInput radius={'md'} label="RPC Endpoint" placeholder='Enter Infura or Alchemy RPC Endpoint ie https://...' {...form.getInputProps('rpc')} />
                        <Box>
                            <Button radius={'md'} type='submit'>Connect Braavos</Button>
                        </Box>
                    </Stack>
                </form>
            </Modal>
        </AppContext.Provider>
    )
}

export default AppProvider
