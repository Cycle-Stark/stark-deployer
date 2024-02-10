import { ActionIcon, Anchor, Avatar, Box, Button, CopyButton, Drawer, Grid, Group, ScrollArea, Stack, Text, Title, Tooltip, rem, useMantineColorScheme } from '@mantine/core'
import { isDarkMode, limitChars } from '../../configs/utils'
import { IconArrowRight, IconCheck, IconCopy, IconExternalLink } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { shortString } from 'starknet'
import { URLS } from '../../configs/config'
import { Link } from 'react-router-dom'
import { db } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

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
                <Text size='xs' fw={400} c="dimmed">{limitChars(value ?? '', charLimit ? charLimit : 10, true)}</Text>
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
    const { colorScheme } = useMantineColorScheme()
    return (
        <Box p="lg" style={theme => ({
            background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
            borderRadius: theme.radius.lg
        })}>
            <Stack gap={4}>
                <Avatar tt={'lowercase'} size={'82px'} mx={'auto'}>
                    {limitChars(info?.tx_info?.deploy?.address, 3, false)}
                </Avatar>
                <InfoRow title='Contract Name' value={info?.name} />
                <InfoRow title='Contract Address' value={info?.tx_info?.deploy?.address} chainId={info?.chainId ?? ''} key_='contract' />
                <InfoRow title='Transaction Hash' value={info?.tx_info?.deploy?.transaction_hash} chainId={info?.chainId ?? ''} key_='tx' />
                <InfoRow title='Class Hash' value={info?.tx_info?.declare?.class_hash} chainId={info?.chainId ?? ''} key_='class' />
                <InfoRow title='Date' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
                <Group justify='space-between'>
                    <Button size='xs' component={Link} color='indigo' to={`/contracts/interact/${info?.id}`} radius={'md'} onClick={open} rightSection={<IconArrowRight size={'18px'} />}>
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
                    <Title order={3}>Declaring</Title>
                    <InfoRow title='Class Hash' value={info?.tx_info?.declare?.class_hash} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='class' />
                    <InfoRow title='Transaction Hash' value={'-'} hideLink={true} charLimit={30} hideCopyButton={true} chainId={info?.chainId ?? ''} key_='tx' />

                    <Title order={3} mt={'xl'}>Deploying</Title>
                    <InfoRow title='Address' value={info?.tx_info?.deploy?.address} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='contract' />
                    <InfoRow title='Contract Address' value={info?.tx_info?.deploy?.contract_address} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='contract' />
                    <InfoRow title='Call Data Length' value={shortString.decodeShortString(info?.tx_info?.deploy?.calldata_len)} hideLink={true} charLimit={30} />
                    <InfoRow title='Transaction Hash' value={info?.tx_info?.deploy?.transaction_hash} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='tx' />
                    <InfoRow title='Class Hash' value={info?.tx_info?.deploy?.classHash} hideLink={false} charLimit={30} chainId={info?.chainId ?? ''} key_='class' />
                    <InfoRow title='Deployer' value={info?.tx_info?.deploy?.deployer} hideLink={true} charLimit={30} />
                    <InfoRow title='Unique' value={info?.tx_info?.deploy?.unique} hideLink={true} charLimit={30} />
                    <InfoRow title='Salt' value={info?.tx_info?.deploy?.salt} hideLink={true} charLimit={30} />

                    <Title order={3} mt={'xl'}>Call Data</Title>
                    {
                        Number(shortString.decodeShortString(info?.tx_info?.deploy?.calldata_len) ?? '0') === 0 ? 'No call data' : null
                    }
                    {
                        info?.tx_info?.deploy?.calldata?.map((item: any, i: any) => (
                            <Text key={`call_data_${i}`} size='sm' color='dimmed'>{item}</Text>
                        ))
                    }
                </Stack>
            </Drawer>
        </Box>
    )
}

const Deployments = () => {
    // const snap = useSnapshot(appState)
    const contracts = useLiveQuery(() => db.contracts.toArray());

    return (
        <div>
            <Box>
                <Stack>
                    <Title order={2}>Deployments ({contracts?.length ?? '0'})</Title>
                    {
                        contracts?.length === 0 || !contracts ? <Text size='sm' fw={500}>No deployments done</Text> : null
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