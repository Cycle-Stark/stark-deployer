import { Box, Container, Grid, Group, ScrollArea, SegmentedControl, Stack, Tabs, Text, TextInput, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { getInterfaceName, isDarkMode, limitChars } from '../../configs/utils';
import CustomSidebarNavLink from '../../components/navigation/CustomSidebarNavLink';
import { IconCodeAsterix, IconDashboard, IconEye, IconSearch, IconTransactionBitcoin, IconWriting, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import DevnetContractProvider, { useDevnetContractContext } from '../../providers/DevnetContractProvider';
import { ReactNode } from 'react';

interface IContractLayout {
    children: React.ReactNode
}


interface ISideBarContents {
    deployment: any
    interfaces: any
    functions: any
    extra_functions: any
}

const SideBarContents = (props: ISideBarContents) => {
    const { deployment, interfaces, functions, extra_functions } = props

    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    const form = useForm({
        initialValues: {
            activeTab: 'all',
            search: ''
        }
    })

    const HEADER_HEIGHT = "280px"

    return (
        <Stack h={'100%'} pt="md">
            <Box pb="xs" h={HEADER_HEIGHT}>
                <Stack px={'md'} gap={6}>
                    <CustomSidebarNavLink title={"Go to Contracts"} to={`/devnet/contracts/`}
                        icon={<IconCodeAsterix />}
                        color={'pink'}
                    />
                    <CustomSidebarNavLink title={"Dashboard"} to={`/devnet/contracts/interact/${deployment?.id}/dashboard`}
                        icon={<IconDashboard />}
                        color={'violet'}
                    />
                    <CustomSidebarNavLink title={"Function Calls/Invoke"} to={`/devnet/contracts/interact/${deployment?.id}/transactions`}
                        icon={<IconTransactionBitcoin />}
                        color={'violet'}
                    />
                    <CustomSidebarNavLink title={"ABI"} to={`/devnet/contracts/interact/${deployment?.id}/abi`}
                        icon={<IconCodeAsterix />}
                        color={'violet'}
                    />
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
            </Box>
            <Box component={ScrollArea} py={'sm'} scrollbarSize={10} style={{
                background: isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.indigo[1],
                // borderRadius: theme.radius.lg
                borderRadius: "20px 20px 0 0",
                height: `calc(100% - ${HEADER_HEIGHT})`
            }}>
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
                                                            to={`/devnet/contracts/interact/${deployment?.id}/functions/${func?.name}`}
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
                                                    to={`/devnet/contracts/interact/${deployment?.id}/functions/${func?.name}`}
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
                                                to={`/devnet/contracts/interact/${deployment?.id}/functions/${func?.name}`}
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
                                                to={`/devnet/contracts/interact/${deployment?.id}/functions/${func?.name}`}
                                                icon={func?.state_mutability === 'external' ? <IconWriting /> : <IconEye />}
                                                color={func?.state_mutability === 'external' ? 'green' : 'darkBlue'} />
                                        ))
                                    }
                                </Stack>
                            </Box>
                        </Tabs.Panel>
                    </Tabs>
                </Stack>
            </Box>
        </Stack>
    )
}


interface ICustomBox {
    height: string | number
    children: ReactNode
}

const CustomBox = (props: ICustomBox) => {
    const { height, children } = props
    const { colorScheme } = useMantineColorScheme()

    return (
        <Box h={height} style={theme => ({
            background: isDarkMode(colorScheme) ? theme.colors.dark[9] : theme.colors.gray[2],
            borderRadius: theme.radius.md
        })}>
            {children}
        </Box>
    )
}

const DevnetContractAppShell = (props: IContractLayout) => {
    const { children } = props
    const { interfaces, deployment, functions, extra_functions } = useDevnetContractContext()
    const { height } = useViewportSize();

    const HEIGHT = `${height - 75}px`

    return (
        <Container size={"xxl"} p={"sm"} style={{ overflow: "hidden" }} h={HEIGHT}>
            <Grid h={HEIGHT}>
                <Grid.Col span={3} h={HEIGHT}>
                    <CustomBox height={'100%'}>
                        <SideBarContents deployment={deployment} interfaces={interfaces} functions={functions} extra_functions={extra_functions} />
                    </CustomBox>
                </Grid.Col>
                <Grid.Col h={HEIGHT} span={9}>
                    <CustomBox height={'100%'}>
                            <Container size={'xxl'} h={'100%'} style={{overflowY: 'auto'}}>
                                <Box py={'lg'}>
                                    {children}
                                </Box>
                            </Container>
                    </CustomBox>
                </Grid.Col>
            </Grid>
        </Container>
    )
}




export function DevnetContractLayout(props: IContractLayout) {
    const { children } = props
    return (
        <DevnetContractProvider>
            <DevnetContractAppShell>
                {children}
            </DevnetContractAppShell>
        </DevnetContractProvider>
    );
}
