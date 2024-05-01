import { Menu, Button, rem, ActionIcon, Box, Popover, Text, Group } from '@mantine/core';
import {
    IconSelector,
    IconTestPipe,
    IconNetwork,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAppContext } from '../../providers/AppProvider';

const DisclaimerIcon = () => {
    const [opened, { close, open }] = useDisclosure(false);

    return (
        <Popover width={200} position="bottom" shadow="md" opened={opened} radius={'md'}>
            <Popover.Target>
                <Group onMouseEnter={open} onMouseLeave={close} >
                    <IconInfoCircle color='gray' stroke={1.5} />
                </Group>
            </Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                <Text size="sm">
                    You have connected a braavos walllet. Kindly switch the network manually and reconnect your wallet.
                </Text>
            </Popover.Dropdown>
        </Popover>
    )
}


function BraavosConnectedPopoverIcon() {
    const { chainId } = useAppContext()

    return (
        <Button disabled radius={'xl'} size='sm' variant='outline' rightSection={<DisclaimerIcon />} color={chainId === 'SN_MAIN' ? 'indigo' : 'orange'}>
            {chainId === 'SN_MAIN' ? 'Mainnet' : 'Testnet'}
        </Button>
    );
}

export default function SwitchNetwork() {
    const { connection, switchNetwork, chainId, isSmallScreen, connectedWallet } = useAppContext()
    return (
        <Menu shadow="md" width={200} radius={'lg'} withArrow>
            <Menu.Target>
                {
                    isSmallScreen ? (
                        <ActionIcon variant='outline' color={chainId === 'SN_MAIN' ? 'indigo' : 'orange'} radius={'md'} disabled={connectedWallet === 'braavos'}>
                            <Box style={{
                                width: '10px',
                                height: '10px',
                                background: chainId === 'SN_MAIN' ? 'indigo' : 'orange',
                                borderRadius: '50px'
                            }} />
                        </ActionIcon>
                    ) : (
                        <Box>
                            {
                                connectedWallet === 'braavos' ? (
                                    <Box>
                                        <BraavosConnectedPopoverIcon />
                                    </Box>
                                ) : (
                                    <Button disabled={connectedWallet === 'braavos'} radius={'xl'} size='sm' variant='outline' rightSection={connectedWallet === 'braavos' ? <BraavosConnectedPopoverIcon /> : <IconSelector stroke={1.5} />} color={chainId === 'SN_MAIN' ? 'indigo' : 'orange'}>
                                        {chainId === 'SN_MAIN' ? 'Mainnet' : 'Testnet'}
                                    </Button>
                                )
                            }
                        </Box>
                    )
                }
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Select Network</Menu.Label>
                <Menu.Item disabled={chainId === 'SN_SEPOLIA'} color='orange' leftSection={<IconTestPipe style={{ width: rem(14), height: rem(14) }} />} onClick={() => switchNetwork(connection, "SN_SEPOLIA")}>
                    Sepolia Testnet
                </Menu.Item>
                <Menu.Item disabled={chainId === 'SN_MAIN'} color='indigo' leftSection={<IconNetwork style={{ width: rem(14), height: rem(14) }} />} onClick={() => switchNetwork(connection, "SN_MAIN")}>
                    Mainnet
                </Menu.Item>
            </Menu.Dropdown>
        </Menu >
    );
}