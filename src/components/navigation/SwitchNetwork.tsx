import { Menu, Button, rem, ActionIcon, Box } from '@mantine/core';
import {
    IconSelector,
    IconTestPipe,
    IconNetwork,
} from '@tabler/icons-react';
import { useAppContext } from '../../providers/AppProvider';

export default function SwitchNetwork() {
    const { connection, switchNetwork, chainId, isSmallScreen } = useAppContext()

    return (
        <Menu shadow="md" width={200} radius={'lg'} withArrow>
            <Menu.Target>
                {
                    isSmallScreen ? (
                        <ActionIcon variant='outline' color={chainId === 'SN_MAIN' ? 'indigo' : 'orange'} radius={'md'}>
                            <Box style={{
                                width: '10px',
                                height: '10px',
                                background: chainId === 'SN_MAIN' ? 'indigo' : 'orange',
                                borderRadius: '50px'
                            }} />
                        </ActionIcon>
                    ) : (

                        <Button radius={'xl'} size='sm' variant='outline' rightSection={<IconSelector stroke={1.5} />} color={chainId === 'SN_MAIN' ? 'indigo' : 'orange'}>
                            {chainId === 'SN_MAIN' ? 'Mainnet' : 'Testnet'}
                        </Button>
                    )
                }
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Select Network</Menu.Label>
                <Menu.Item disabled={chainId === 'SN_GOERLI'} color='orange' leftSection={<IconTestPipe style={{ width: rem(14), height: rem(14) }} />} onClick={() => switchNetwork(connection, "SN_GOERLI")}>
                    Testnet
                </Menu.Item>
                <Menu.Item disabled={chainId === 'SN_MAIN'} color='indigo' leftSection={<IconNetwork style={{ width: rem(14), height: rem(14) }} />} onClick={() => switchNetwork(connection, "SN_MAIN")}>
                    Mainnet
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}