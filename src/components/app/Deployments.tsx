import { ActionIcon, Anchor, Avatar, Box, Button, Card, Center, CopyButton, Drawer, Grid, Group, ScrollArea, SegmentedControl, Stack, Text, TextInput, Title, Tooltip, rem, useMantineColorScheme } from '@mantine/core'
import { isDarkMode, limitChars } from '../../configs/utils'
import { IconArrowRight, IconCheck, IconCopy, IconExternalLink, IconSearch, IconX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { URLS } from '../../configs/config'
import { Link } from 'react-router-dom'
import { db } from '../../db'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../providers/AppProvider'

interface IDeploymentCard {
    info: any
}

interface IInfoRow {
    key_?: 'contract' | 'class' | 'tx'
    title: string
    value: string
    hideLink?: boolean
    hideCopyButton?: boolean
    charLimit?: number
    chainId?: string
}
export const InfoRow = (props: IInfoRow) => {
    const { title, value, hideLink, charLimit, hideCopyButton, chainId, key_ } = props
    const getUrl = () => {
        if (chainId === 'SN_GOERLI') {
            return URLS[`${key_}_testnet`] + value
        }
        if (chainId === 'SN_SEPOLIA') {
            return URLS[`${key_}_testnet`] + value
        }
        if (chainId === 'SN_MAIN') {
            return URLS[`${key_}_mainnet`] + value
        }
        if (chainId === 'DEVNET') {
            return URLS[`${key_}_devnet`] + value
        }
        return '#'
    }

    return (
        <Group justify='space-between' wrap='nowrap' align='center'>
            <Text size='sm' fw={500}>{title}</Text>
            <Group align='center' wrap='nowrap' gap={4}>
                <Text size='xs' fw={400} c="dimmed">{limitChars(value ?? '', charLimit ? charLimit : 6, true)}</Text>
                {
                    !hideCopyButton ? (
                        <CopyButton value={value} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                        {copied ? (
                                            <IconCheck style={{ width: rem(16) }} />
                                        ) : (
                                            <IconCopy style={{ width: rem(16) }} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>
                    ) : null
                }
                {
                    chainId ? (
                        <Anchor href={getUrl()} target='_blank' display={hideLink ? 'none' : 'block'}>
                            <IconExternalLink style={{ width: rem(16) }} />
                        </Anchor>
                    ) : null
                }
            </Group>
        </Group>
    )
}

const DeploymentCard = (props: IDeploymentCard) => {
    const { info } = props
    const [opened, { open, close }] = useDisclosure(false);
    const { chainId } = useAppContext()
    const { colorScheme } = useMantineColorScheme()
    // console.log(info)
    return (
        <Box p="lg" style={theme => ({
            background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
            borderRadius: theme.radius.lg
        })}>
            <Stack gap={4}>
                <Avatar tt={'lowercase'} size={'82px'} mx={'auto'} radius={'md'}>
                    {limitChars(info?.contract_address, 3, false)}
                </Avatar>
                <InfoRow title='Contract Name' value={info?.name} charLimit={20} hideCopyButton />
                <InfoRow title='Chaind ID' value={info?.chainId} hideCopyButton={true} charLimit={20} />
                <InfoRow title='Contract Address' value={info?.contract_address} chainId={info?.chainId ?? ''} key_='contract' />
                <InfoRow title='Transaction Hash' value={info?.tx_info?.transaction_hash} chainId={info?.chainId ?? ''} key_='tx' />
                {/* <InfoRow title='Class Hash' value={info?.tx_info?.declare?.class_hash} chainId={info?.chainId ?? ''} key_='class' /> */}
                <InfoRow title='Date' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
                <Group justify='space-between'>
                    <Button disabled={chainId !== info?.chainId} size='xs' component={Link} color='indigo' to={`/contracts/interact/${info?.id}`} radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
                        Interact
                    </Button>
                    <Button size='xs' radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
                        More Info
                    </Button>
                </Group>
            </Stack>
            <Drawer opened={opened} onClose={close} title="Deployment Information" position='right' size={'md'} lockScroll={true} scrollAreaComponent={ScrollArea} >
                <Stack gap={4}>
                    <InfoRow title='Date & Time' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
                    <InfoRow title='Chaind ID' value={info?.chainId} hideCopyButton={true} charLimit={20} />
                    {/* <Title order={3}>Declaring</Title>
                    <InfoRow title='Class Hash' value={info?.tx_info?.declare?.class_hash} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='class' />
                    <InfoRow title='Transaction Hash' value={'-'} hideLink={true} charLimit={30} hideCopyButton={true} chainId={info?.chainId ?? ''} key_='tx' /> */}

                    <Title order={3} mt={'xl'}>Deployment</Title>
                    {/* <InfoRow title='Address' value={info?.tx_info?.deploy?.address} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='contract' /> */}
                    <InfoRow title='Contract Address' value={info?.contract_address} hideLink={false} charLimit={26} chainId={info?.chainId ?? ''} key_='contract' />
                    {/* <InfoRow title='Call Data Length' value={shortString.decodeShortString(info?.tx_info?.deploy?.calldata_len)} hideLink={true} charLimit={30} /> */}
                    <InfoRow title='Transaction Hash' value={info?.tx_info?.transaction_hash} hideLink={false} charLimit={26} chainId={info?.chainId ?? ''} key_='tx' />
                    {/* <InfoRow title='Class Hash' value={info?.tx_info?.deploy?.classHash} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='class' />
                    <InfoRow title='Deployer' value={info?.tx_info?.deploy?.deployer} hideLink={true} charLimit={30} />
                    <InfoRow title='Unique' value={info?.tx_info?.deploy?.unique} hideLink={true} charLimit={30} />
                    <InfoRow title='Salt' value={info?.tx_info?.deploy?.salt} hideLink={true} charLimit={30} /> */}

                    {/* <Title order={3} mt={'xl'}>Call Data</Title> */}
                    {/* {
                        Number(shortString.decodeShortString(info?.tx_info?.deploy?.calldata_len) ?? '0') === 0 ? 'No call data' : null
                    } */}
                    {/* {
                        info?.tx_info?.deploy?.calldata?.map((item: any, i: any) => (
                            <Text key={`call_data_${i}`} size='sm' color='dimmed'>{item}</Text>
                        ))
                    } */}
                </Stack>
            </Drawer>
        </Box>
    )
}

const Deployments = () => {
    // const snap = useSnapshot(appState)
    const [chainId, setChainId] = useState('')
    const [searchText, setSearchText] = useState<string>('')
    const [contracts, setContracts] = useState<any>([])

    // const contracts = useLiveQuery(() => db.contracts.filter(item => item?.chainId === '').toArray());
    const loadContracts = async () => {
        if (chainId === '') {
            const regex = new RegExp(searchText, 'i')
            const contracts_ = await db.contracts.filter(item => regex.test(item.name)).toArray()
            setContracts(contracts_)
        }
        else {
            const regex = new RegExp(searchText, 'i')
            const contracts_ = await db.contracts.filter(item => item.chainId === chainId).filter(item => regex.test(item.name)).toArray()
            setContracts(contracts_)
        }
    }

    useEffect(() => {
        loadContracts()
    }, [chainId, searchText])

    return (
        <div>
            <Box>
                <Stack>
                    <Title order={2}>Contracts ({contracts?.length ?? '0'})</Title>
                    <Stack gap={6}>
                        <SegmentedControl radius={'md'} fullWidth data={[
                            {
                                value: '',
                                label: 'All'
                            },
                            {
                                value: 'SN_SEPOLIA',
                                label: 'Sepolia Testnet'
                            },
                            {
                                value: 'SN_MAIN',
                                label: 'Mainnet'
                            },
                        ]} value={chainId} onChange={setChainId} />
                        <TextInput placeholder='Search by Name' leftSection={<IconSearch size={'18px'} />} rightSection={<IconX size={'18px'} onClick={() => setSearchText('')} />} radius={'md'} value={searchText} onChange={e => setSearchText(e.currentTarget.value)} />
                    </Stack>
                    {
                        contracts?.length === 0 || !contracts ?
                            <Card h={'280px'} radius={'md'}>
                                <Center h={'100%'}>
                                    <Text size='sm' fw={500}>No contract deployments found.</Text>
                                </Center>
                            </Card> : null
                    }
                    <Grid>
                        {
                            contracts?.map((deployment: any, i: any) => (
                                <Grid.Col key={`deployment_${i}`} span={{ md: 4 }}>
                                    <DeploymentCard info={deployment} />
                                </Grid.Col>
                            ))
                        }
                    </Grid>
                </Stack>
            </Box>
        </div>
    )
}

export default Deployments


