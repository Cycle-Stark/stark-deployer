import { ActionIcon, Anchor, Avatar, Box, Button, Card, Center, CopyButton, Drawer, Grid, Group, ScrollArea, SegmentedControl, Stack, Text, TextInput, Title, Tooltip, em, rem, useMantineColorScheme } from '@mantine/core'
import { isDarkMode, limitChars } from '../../configs/utils'
import { IconArrowRight, IconCheck, IconCopy, IconExternalLink, IconInfoCircle, IconSearch, IconTrash, IconX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { URLS } from '../../configs/config'
import { Link } from 'react-router-dom'
import { db } from '../../db'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../providers/AppProvider'
import { showNotification } from '@mantine/notifications'
import { modals } from '@mantine/modals'

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
            <Text size='xs' fw={500}>{title}</Text>
            <Group align='center' wrap='nowrap' gap={4}>
                <Text size='xs' fw={400} c="dimmed">{limitChars(value ?? '', charLimit ? charLimit : 6, true)}</Text>
                {
                    !hideCopyButton ? (
                        <CopyButton value={value} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                    <ActionIcon size={'xs'} color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
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
                        <Anchor href={getUrl()} size='xs' target='_blank' display={hideLink ? 'none' : 'block'}>
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
    const [loading, setLoading] = useState(false)
    const [opened, { open, close }] = useDisclosure(false);
    const { chainId } = useAppContext()
    const { colorScheme } = useMantineColorScheme()

    const deleteContract = () => {
        setLoading(true)
        db.function_calls.where('contract_address').equalsIgnoreCase(info?.contract_address).delete()
        db.contracts.delete(info?.id).then(() => {
            showNotification({
                title: "Contract deletion",
                message: "Contract deleted successfully",
                icon: <IconInfoCircle />
            })
            window.location.reload()
        }).catch(() => { }).finally(() => {
            setLoading(false)
        })
    }

    const showDeletionModal = () => modals.openConfirmModal({
        children: (
            <Text>Are you sure you want to delete {`'${info?.name}' Contract?`}</Text>
        ),
        onConfirm: deleteContract,
        confirmProps: {
            color: 'red',
            radius: 'md'
        },
        cancelProps: {
            radius: 'md'
        },
        labels: {
            confirm: 'Delete',
            cancel: 'Cancel'
        }
    })

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
                <InfoRow title='Deployment ID' value={info?.id} charLimit={20} hideCopyButton />
                <InfoRow title='Chaind ID' value={info?.chainId} hideCopyButton={true} charLimit={20} />
                <InfoRow title='Contract Address' value={info?.contract_address} chainId={info?.chainId ?? ''} key_='contract' />
                <InfoRow title='Transaction Hash' value={info?.tx_info?.transaction_hash} chainId={info?.chainId ?? ''} key_='tx' />
                {/* <InfoRow title='Class Hash' value={info?.tx_info?.declare?.class_hash} chainId={info?.chainId ?? ''} key_='class' /> */}
                <InfoRow title='Date' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
                <Group justify='space-between' wrap='nowrap'>
                    {chainId !== info?.chainId ? (
                        <Button disabled={true} size='xs' color='indigo' radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
                            Interact
                        </Button>
                    ) : (
                        <Button size='xs' component={Link} color='indigo' to={`/contracts/interact/${info?.id}`} radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
                            Interact
                        </Button>
                    )}
                    <Group wrap='nowrap' gap={'xs'}>
                        <Button size='xs' radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
                            More Info
                        </Button>
                        <Tooltip label="Delete" color='red' fs={'14px'}>
                            <ActionIcon radius={'sm'} size={'sm'} variant='light' color='red' onClick={showDeletionModal} loading={loading}>
                                <IconTrash stroke={em(1.5)} size={'18px'} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Stack>
            <Drawer opened={opened} onClose={close} title="Deployment Information" position='right' size={'md'} lockScroll={true} scrollAreaComponent={ScrollArea} >
                <Stack gap={4}>
                    <InfoRow title='Date & Time' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
                    <InfoRow title='Chaind ID' value={info?.chainId} hideCopyButton={true} charLimit={20} />
                    <Title order={3} mt={'xl'}>Deployment</Title>
                    <InfoRow title='Contract Address' value={info?.contract_address} hideLink={false} charLimit={26} chainId={info?.chainId ?? ''} key_='contract' />
                    <InfoRow title='Transaction Hash' value={info?.tx_info?.transaction_hash} hideLink={false} charLimit={26} chainId={info?.chainId ?? ''} key_='tx' />
                </Stack>
            </Drawer>
        </Box>
    )
}

const Deployments = () => {
    const [chainId, setChainId] = useState('')
    const [searchText, setSearchText] = useState<string>('')
    const [contracts, setContracts] = useState<any>([])

    const regex = new RegExp(searchText, 'i')

    // const contracts = useLiveQuery(() => query)

    const loadContracts = async () => {

        if (chainId !== '') {
            let contracts_ = await db.contracts.where('chainId').equalsIgnoreCase(chainId).filter(item => regex.test(item.name)).reverse().toArray()
            setContracts(contracts_)
        } else {

            let contracts_ = await db.contracts.filter(item => regex.test(item.name)).reverse().toArray()
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


