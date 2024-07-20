import { Menu, Button, rem, useMantineColorScheme, useMantineTheme, CopyButton, Group, ActionIcon, em, Text } from '@mantine/core';
import {
    IconCheck,
    IconCopy,
    IconWallet,
} from '@tabler/icons-react';
import { useDevnetContext } from '../../providers/DevnetProvider';
import { isDarkMode, limitChars } from '../../configs/utils';

export function SwitchAccountBtn() {

    const { accounts, address, connectAccount } = useDevnetContext()
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    return (
        <>
            {
                address ? (
                    <Menu shadow="md" width={230} radius={'md'} withArrow position='bottom-end'>
                        <Menu.Target>
                            <Button color='green' radius={'md'} variant='outline' leftSection={<IconWallet color='green' />}>
                                {limitChars(address ?? '', 10, true)}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Accounts</Menu.Label>
                            {
                                accounts?.map((acc: any, i: number) => (
                                    <Group key={acc?.address} wrap='nowrap'>
                                        <Menu.Item key={`account_${i}`}
                                            color={address === acc?.address ? 'green' : isDarkMode(colorScheme) ? theme.colors.gray[1] : theme.colors.dark[4]}
                                            variant={address === acc?.address ? 'light' : 'outline'}
                                            onClick={() => connectAccount(i)}
                                            leftSection={<IconWallet style={{ width: rem(14), height: rem(14) }} />}
                                            fw={500}
                                            fs={'14px'}
                                        >
                                            <Text size='xs' fw={500}>{limitChars(acc?.address ?? '', 16, true)}</Text>
                                        </Menu.Item>
                                        <CopyButton value={acc?.address}>
                                            {({ copied, copy }) => (
                                                <ActionIcon onClick={copy} size={'xs'} variant='transparent' color={copied ? 'green' : 'blue'}>
                                                    {
                                                        copied ? <IconCheck stroke={em(1.5)} size={'18px'} /> :
                                                            <IconCopy stroke={em(1.5)} size={'18px'} />
                                                    }
                                                </ActionIcon>
                                            )}
                                        </CopyButton>
                                    </Group>
                                ))
                            }
                        </Menu.Dropdown>
                    </Menu>)
                    :
                    null
            }
        </>
    );
}