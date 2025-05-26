import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { connect, disconnect } from 'starknetkit';
import { modals } from '@mantine/modals';
import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useSnapshot } from 'valtio';
import appState from '../configs/storage';
import { RpcProvider, shortString } from 'starknet';
import { showNotification } from '@mantine/notifications';

interface IAppContext {
    provider: any;
    switchNetwork: (connection: any, chainId: 'SN_MAIN' | 'SN_SEPOLIA') => void;
    account: any;
    address: string;
    chainId: string;
    connectedWallet: string;
    connection: any;
    handleConnectWalletBtnClick: () => void;
    isSmallScreen: boolean;
}

const initialData: IAppContext = {
    provider: null,
    switchNetwork: () => { },
    account: null,
    address: '',
    chainId: 'SN_SEPOLIA',
    connectedWallet: '',
    connection: null,
    handleConnectWalletBtnClick: () => { },
    isSmallScreen: false,
};

export const AppContext = createContext<IAppContext>(initialData);

export const useAppContext = () => useContext(AppContext);

interface IAppProvider {
    children: ReactNode;
}

const AppProvider = ({ children }: IAppProvider) => {
    const [provider, setProvider] = useState<any>(null);
    const [chainId, setChainId] = useState<string>('SN_SEPOLIA');
    const [connectedWallet, setConnectedWallet] = useState<string>('');
    const [connection, setConnection] = useState<any>(null);
    const [account, setAccount] = useState<any>(null);
    const [address, setAddress] = useState<string>('');
    const [isSmallScreen, setIsSmallScreen] = useState<any>(false);

    const [opened, { open, close }] = useDisclosure(false);
    const matches = useMediaQuery('(max-width: 768px)');

    const snap = useSnapshot(appState, { sync: true });

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/[a-zA-Z0-9-_.~!*'();:@&=+$,%#]+)*\/?$/;

    const form = useForm({
        initialValues: {
            rpc_mainnet: snap.mainnetRPCEndpoint,
            rpc_sepolia: snap.sepoliaRPCEndpoint,
        },
        validate: {
            rpc_mainnet: (value) =>
                value === '' || value === null
                    ? 'Mainnet RPC endpoint is required!'
                    : !urlRegex.test(value)
                        ? 'Enter valid URL!'
                        : null,
            rpc_sepolia: (value) =>
                value === '' || value === null
                    ? 'Sepolia RPC endpoint is required!'
                    : !urlRegex.test(value)
                        ? 'Enter valid URL!'
                        : null,
        },
    });

    const connectWallet = async (modalMode: "canAsk" | "alwaysAsk" | "neverAsk" | undefined = "canAsk") => {
        if (!form.values.rpc_mainnet || !form.values.rpc_sepolia) {
            showNotification({ message: 'RPC endpoints required for connection.' });
            return;
        }

        const RPC_ENDPOINT = chainId === 'SN_SEPOLIA' ? form.values.rpc_sepolia : form.values.rpc_mainnet;
        const provider = new RpcProvider({ nodeUrl: RPC_ENDPOINT });

        const connection = await connect({
            webWalletUrl: 'https://web.argent.xyz',
            dappName: 'Stark Deployer',
            modalMode: modalMode,
            resultType: 'wallet',
            provider: provider
        });

        if (connection?.wallet?.isConnected) {
            setConnectedWallet(connection.wallet.id);
            setConnection(connection);
            setAccount(connection.wallet.account);
            setAddress(connection.wallet.selectedAddress);
            setProvider(provider);

            appState.mainnetRPCEndpoint = form.values.rpc_mainnet;
            appState.sepoliaRPCEndpoint = form.values.rpc_sepolia;

            handleChainIdMismatch(connection);
        }
        close();
    };

    const handleChainIdMismatch = (connection: any) => {

        let chainID_FROM_PROVIDER = ""
        let chainID_FROM_WALLET_CONNECTION = ""

        if (connection?.wallet?.id === 'argentX') {
            chainID_FROM_WALLET_CONNECTION = connection?.wallet?.chainId
            chainID_FROM_PROVIDER = shortString.decodeShortString(connection?.wallet?.provider?.provider?.chainId);
        } else {
            chainID_FROM_PROVIDER = shortString.decodeShortString(connection?.wallet?.provider?.chainId);
            chainID_FROM_WALLET_CONNECTION = chainId === "SN_MAIN" ? shortString.decodeShortString(connection?.wallet?.chainId) : "SN_SEPOLIA"
        }

        if (chainID_FROM_PROVIDER !== chainID_FROM_WALLET_CONNECTION) {
            showNotification({
                message: `Network mismatch. You have selected ${chainId} but your wallet is at ${chainID_FROM_WALLET_CONNECTION}. Change wallet network and reconnect please.`,
            });
            disconnectWallet();
        }
    };

    const switchNetwork = async (connection: any, newChainId: 'SN_MAIN' | 'SN_SEPOLIA' = 'SN_SEPOLIA') => {
        if (connectedWallet === 'braavos') {
            alert(`Please manually switch your wallet to ${newChainId === 'SN_SEPOLIA' ? 'Mainnet' : 'Sepolia'} and reconnect.`);
            disconnectWallet();
            return;
        }

        setChainId(newChainId);
        appState.activeChainId = newChainId;

        if (connection) {
            try {
                await connection.wallet.request({
                    type: 'wallet_switchStarknetChain',
                    params: { chainId: newChainId },
                });
                disconnectWallet();
                connectWallet('canAsk');
            } catch (error) {
                console.error('Error switching network:', error);
                if (connectedWallet === 'braavos') {
                    alert(`Please manually switch your wallet to ${newChainId === 'SN_SEPOLIA' ? 'Mainnet' : 'Sepolia'} and reconnect.`);
                    disconnectWallet();
                }
            }
        }
    };

    const disconnectWallet = async () => {
        await disconnect({ clearLastWallet: false });
        setConnection(null);
        setAccount(null);
        setAddress('');
        setProvider(null);
        setConnectedWallet('');
    };

    const openConfirmDisconnectModal = () =>
        modals.openConfirmModal({
            title: 'You are about to disconnect your wallet!',
            centered: true,
            radius: 'md',
            children: <Text size="sm">Are you sure you want to disconnect your account?</Text>,
            labels: { confirm: 'Disconnect', cancel: 'Cancel' },
            confirmProps: { radius: 'md', variant: 'light' },
            cancelProps: { radius: 'md', variant: 'light' },
            onCancel: () => { },
            onConfirm: () => disconnectWallet(),
        });

    const handleConnectWalletBtnClick = () => {
        if (!account) {
            open();
        } else {
            openConfirmDisconnectModal();
        }
    };

    const contextValue = useMemo(
        () => ({
            switchNetwork,
            chainId,
            connectedWallet,
            provider,
            account,
            address,
            connection,
            handleConnectWalletBtnClick,
            isSmallScreen,
        }),
        [account, address, connection, chainId, matches]
    );

    useEffect(() => {
        setIsSmallScreen(matches);
    }, [matches]);

    useEffect(() => {
        connectWallet()
        setChainId(snap.activeChainId ?? 'SN_SEPOLIA');
    }, []);

    useEffect(() => {
        if (connection) {
            console.log("change")
            connection?.wallet?.on({
                type: 'accountsChanged',
            }).then((res: any) => {
                console.log(res)
            }).catch((error: any) => {
                console.error(error)
            })
        }
    }, [])

    return (
        <AppContext.Provider value={contextValue}>
            {children}
            <Modal radius="md" opened={opened} onClose={close} size="lg" title="Connect with RPC">
                <form onSubmit={form.onSubmit(() => connectWallet())}>
                    <Stack>
                        <TextInput
                            radius="md"
                            label="Mainnet RPC Endpoint"
                            placeholder="Enter Infura or Alchemy RPC Endpoint i.e., https://..."
                            {...form.getInputProps('rpc_mainnet')}
                        />
                        <TextInput
                            radius="md"
                            label="Sepolia RPC Endpoint"
                            placeholder="Enter Infura or Alchemy RPC Endpoint i.e., https://..."
                            {...form.getInputProps('rpc_sepolia')}
                        />
                        <Box>
                            <Button radius="md" type="submit">
                                Connect
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Modal>
        </AppContext.Provider>
    );
};

export default AppProvider;

