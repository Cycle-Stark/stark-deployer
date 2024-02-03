import { Menu, Button, rem, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import {
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
                    <Menu shadow="md" width={230} radius={'lg'} withArrow position='bottom-end'>
                        <Menu.Target>
                            <Button color='green' radius={'md'} variant='outline' leftSection={<IconWallet color='green' />}>
                                {limitChars(address ?? '', 10, true)}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Accounts</Menu.Label>
                            {
                                accounts?.map((acc: any, i: number) => (
                                    <Menu.Item key={`account_${i}`}
                                        color={address === acc?.address ? 'green' : isDarkMode(colorScheme) ? theme.colors.gray[1] : theme.colors.dark[4]}
                                        variant={address === acc?.address ? 'light' : 'outline'}
                                        onClick={() => connectAccount(i)}
                                        leftSection={<IconWallet style={{ width: rem(14), height: rem(14) }} />}
                                        fw={500}
                                    >
                                        {limitChars(acc?.address ?? '', 16, true)}
                                    </Menu.Item>
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