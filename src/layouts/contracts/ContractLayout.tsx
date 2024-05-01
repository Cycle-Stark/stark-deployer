import { ActionIcon, AppShell, Box, Burger, Button, Group, ScrollArea, SegmentedControl, Stack, Tabs, Text, TextInput, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ContractProvider, { useContractContext } from '../../providers/ContractProvider';
import { getInterfaceName, isDarkMode, limitChars } from '../../configs/utils';
import CustomSidebarNavLink from '../../components/navigation/CustomSidebarNavLink';
import { IconAdjustmentsHorizontal, IconCodeAsterix, IconDashboard, IconEye, IconHome, IconReload, IconSearch, IconTransactionBitcoin, IconWriting, IconX } from '@tabler/icons-react';
import ColorSchemeToggle from '../../components/ColorSchemeToggle';
import { useForm } from '@mantine/form';
import ApproveTool from '../../components/handy_tools/ApproveTool';
import ConvertToLargeNumber from '../../components/handy_tools/ConvertToLargeNumber';
import CustomAccordion, { AccordionItem } from '../../components/common/CustomAccordion';
import AboutContract from '../../components/handy_tools/AboutContract';
import AppProvider from '../../providers/AppProvider';
import QuickNotes from '../../components/handy_tools/QuickNotes';
import ConnectWalletBtn from '../../components/navigation/ConnectWalletBtn';
import SwitchNetwork from '../../components/navigation/SwitchNetwork';

interface IContractLayout {
    children: React.ReactNode
}


const ContractAppShell = (props: IContractLayout) => {
    const { children } = props
    const [opened, { toggle }] = useDisclosure();
    const aside = useDisclosure(true);
    const { interfaces, deployment, functions, extra_functions, reLoadAbi } = useContractContext()
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    const form = useForm({
        initialValues: {
            activeTab: 'all',
            search: ''
        }
    })

    const itemList: AccordionItem[] = [
        {
            id: 'about',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'About Contract',
            description: 'A quick information about the current contract',
            content: <AboutContract color='orange' />,
        },
        {
            id: 'notes',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'Notes',
            description: 'A quick way to save different notes',
            content: <QuickNotes color='yellow' />,
        },
        {
            id: 'approver',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'Token Approver Tool',
            description: 'A tool to help you approve token usage for your contract(s) in a quick and easy way',
            content: <ApproveTool contract_address={deployment?.contract_address} color='violet' />
        },
        {
            id: 'convert',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'Large Number Creator Tool',
            description: 'A tool to help you create Large Numbers for use in your contract ie tokens',
            content: <ConvertToLargeNumber color="indigo" />
        },
    ]

    return (
        <AppShell
            header={{ height: 70 }}
            navbar={{ width: 320, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            aside={{ width: { base: 420 }, breakpoint: "sm", collapsed: { desktop: aside[0], mobile: aside[0] } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify='space-between'>
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Title order={2} fw={500}>{`${deployment?.name ?? 'contract'} - ${deployment?.chainId}`}</Title>
                    <Group h={'100%'}>
                        <SwitchNetwork />
                        <ConnectWalletBtn />
                        <ActionIcon onClick={aside[1].toggle} variant='light' radius='md'>
                            <IconAdjustmentsHorizontal />
                        </ActionIcon>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar pt="md" bg={isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.gray[2]} withBorder={false}>
                <AppShell.Section pb="xs">
                    <Stack px={'md'} gap={6}>
                        <CustomSidebarNavLink title={"Go Home"} to={`/`}
                            icon={<IconHome />}
                            color={'pink'}
                        />
                        <CustomSidebarNavLink title={"Dashboard"} to={`/contracts/interact/${deployment?.id}`}
                            icon={<IconDashboard />}
                            color={'pink'}
                        />
                        <CustomSidebarNavLink title={"Function Calls/Invoke"} to={`/contracts/interact/${deployment?.id}/transactions`}
                            icon={<IconTransactionBitcoin />}
                            color={'violet'}
                        />
                        <CustomSidebarNavLink title={"ABI"} to={`/contracts/interact/${deployment?.id}/abi`}
                            icon={<IconCodeAsterix />}
                            color={'violet'}
                        />
                        <Button radius={'md'} variant='light' leftSection={<IconReload />} color='violet' onClick={reLoadAbi}>Reload ABI</Button>
                        <SegmentedControl color='violet' radius={'md'} mt="sm" data={[
                            { value: "all", label: "All" },
                            { value: "write", label: "Write" },
                            { value: "read", label: "Read" },
                        ]} {...form.getInputProps('activeTab')} />
                        <TextInput radius={'md'} placeholder='Search Functions' leftSection={<IconSearch />}
                            type='search' {...form.getInputProps('search')}
                            rightSection={form.values.search !== '' ? <IconX onClick={() => form.setFieldValue('search', '')} /> : null}
                        />
                    </Stack>
                </AppShell.Section>
                <AppShell.Section grow component={ScrollArea} scrollbarSize={10}>
                    <Stack gap={6}>
                        <Tabs defaultValue="all" {...form.getInputProps('activeTab')}>
                            <Tabs.Panel value="all">
                                <Box px="md">
                                    {
                                        interfaces?.map((intf: any, i: number) => (
                                            <Box key={`interface_${i}`} mb="lg">
                                                <Stack gap={6}>
                                                    <Group align='baseline' justify='space-between'>
                                                        <Text size='xs' c="dimmed">Interface</Text>
                                                        <Title order={3} fw={500}>{limitChars(getInterfaceName(intf?.name), 25, true)}</Title>
                                                    </Group>
                                                    {
                                                        intf?.items.filter((item: any) => new RegExp(form.values.search, 'i').test(item.name)).map((func: any, j: number) => (
                                                            <CustomSidebarNavLink key={`sidebar_func_${i}_${j}`} title={limitChars(func.name, 25, false)}
                                                                to={`/contracts/interact/${deployment?.id}/functions/${func?.name}`}
                                                                icon={func?.state_mutability === 'external' ? <IconWriting /> : <IconEye />}
                                                                color={func?.state_mutability === 'external' ? 'green' : 'darkBlue'} />
                                                        ))
                                                    }
                                                </Stack>
                                            </Box>
                                        ))
                                    }
                                    <Box hidden={extra_functions?.length < 1}>
                                        <Stack gap={6}>
                                            <Title order={3} fw={500}>Extra Functions</Title>
                                            {
                                                extra_functions?.filter((item: any) => new RegExp(form.values.search, 'i').test(item.name)).filter((func: any) => func.state_mutability === 'view').map((func: any, j: number) => (
                                                    <CustomSidebarNavLink key={`sidebar_func_extra_${j}`} title={limitChars(func.name, 25, false)}
                                                        to={`/contracts/interact/${deployment?.id}/functions/${func?.name}`}
                                                        icon={func?.state_mutability === 'external' ? <IconWriting /> : <IconEye />}
                                                        color={func?.state_mutability === 'external' ? 'green' : 'darkBlue'} />
                                                ))
                                            }
                                        </Stack>
                                    </Box>
                                </Box>
                            </Tabs.Panel>
                            <Tabs.Panel value="write">
                                <Box px="md">
                                    <Stack gap={6}>
                                        {
                                            functions?.filter((item: any) => new RegExp(form.values.search, 'i').test(item.name)).filter((func: any) => func.state_mutability === 'external').map((func: any, j: number) => (
                                                <CustomSidebarNavLink key={`sidebar_func_extra_${j}`} title={limitChars(func.name, 25, false)}
                                                    to={`/contracts/interact/${deployment?.id}/functions/${func?.name}`}
                                                    icon={func?.state_mutability === 'external' ? <IconWriting /> : <IconEye />}
                                                    color={func?.state_mutability === 'external' ? 'green' : 'darkBlue'} />
                                            ))
                                        }
                                    </Stack>
                                </Box>
                            </Tabs.Panel>
                            <Tabs.Panel value="read">
                                <Box px="md">
                                    <Stack gap={6}>
                                        {
                                            functions?.filter((item: any) => new RegExp(form.values.search, 'i').test(item.name)).filter((func: any) => func.state_mutability === 'view').map((func: any, j: number) => (
                                                <CustomSidebarNavLink key={`sidebar_func_extra_${j}`} title={limitChars(func.name, 25, false)}
                                                    to={`/contracts/interact/${deployment?.id}/functions/${func?.name}`}
                                                    icon={func?.state_mutability === 'external' ? <IconWriting /> : <IconEye />}
                                                    color={func?.state_mutability === 'external' ? 'green' : 'darkBlue'} />
                                            ))
                                        }
                                    </Stack>
                                </Box>
                            </Tabs.Panel>
                        </Tabs>
                    </Stack>
                </AppShell.Section>
                <AppShell.Section p="md">
                    <Group align='center' justify='space-between'>
                        <Text fw={500}>Theme</Text>
                        <ColorSchemeToggle />
                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Aside withBorder={false} p={0}>
                <AppShell.Section grow component={ScrollArea} scrollbarSize={10}>
                    <Stack p="xs">
                        <CustomAccordion itemList={itemList} activeItemsIds={['about', 'approver']} />
                    </Stack>
                </AppShell.Section>
            </AppShell.Aside>
            <AppShell.Main>
                <Box p={'md'} style={theme => ({
                    background: isDarkMode(colorScheme) ? theme.colors.dark[6] : theme.colors.gray[2],
                    borderRadius: theme.radius.md
                })}>
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    )
}

export function ContractLayout(props: IContractLayout) {
    const { children } = props
    return (
        <AppProvider>
            <ContractProvider>
                <ContractAppShell>
                    {children}
                </ContractAppShell>
            </ContractProvider>
        </AppProvider>
    );
}
