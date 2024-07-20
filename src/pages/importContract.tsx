import { useState } from 'react'
import { useAppContext } from '../providers/AppProvider'
import { IconCheck, IconDownload } from '@tabler/icons-react'
import { Box, Button, Container, Grid, Group, Stack, TextInput, Title, useMantineColorScheme } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { db } from '../db'
import { isDarkMode } from '../configs/utils'
import { useNavigate } from 'react-router-dom'

const ImportContract = () => {
    const { provider, chainId } = useAppContext()
    const [loading, setLoading] = useState(false)
    const { colorScheme } = useMantineColorScheme()
    const navigate = useNavigate()

    const form = useForm({
        initialValues: {
            contractName: "",
            contractAddress: "",
        },
        validate: {
            contractName: value => value === "" ? "Contract name is required" : null,
            contractAddress: value => value === "" ? "Contract address is required" : null,
        }
    })
    const handleLoadABI = async () => {
        try {
            setLoading(true)
            if (provider) {
                const new_abi = await provider.getClassAt(form.values.contractAddress)
                const currentTime = new Date()
                db.contracts.add({
                    name: form.values.contractName,
                    tx_info: {},
                    date: `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()}`,
                    chainId: chainId,
                    contract_address: form.values.contractAddress,
                    abi: new_abi
                }).then((_res: any) => {
                    showNotification({
                        message: `Contract imported successfully. Check it out at Deployments from ${chainId} - ChainId`,
                        color: "green",
                        icon: <IconCheck />
                    })
                    // window.location.reload()
                    navigate('/contracts')
                }).catch((err: any) => {
                    showNotification({
                        title: 'Unable to import contract',
                        message: `${err}`,
                        color: 'red'
                    })
                }).finally(() => {
                    setLoading(false)
                })
            }
        } catch (exception) {
            console.log("Exception importing contract: ", exception)
            setLoading(false)
        }
    }

    return (
        <div>
            <Container>
                <Box p="lg" style={theme => ({
                    background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
                    borderRadius: theme.radius.lg
                })}>
                    <Stack>
                        <Title>Import a Contract</Title>
                        <form onSubmit={form.onSubmit(() => handleLoadABI())}>
                            <Grid>
                                <Grid.Col span={{ md: 12 }} >
                                    <TextInput radius={'md'} placeholder="My Contract" label="Contract Name" {...form.getInputProps('contractName')} />
                                </Grid.Col>
                                <Grid.Col span={{ md: 12 }} >
                                    <TextInput radius={'md'} placeholder="0x6B..." label="Contract Address" {...form.getInputProps('contractAddress')} />
                                </Grid.Col>
                                <Grid.Col span={{ md: 12 }}>
                                    <Group justify="center">
                                        <Button size="sm" radius={'md'} type='submit' leftSection={<IconDownload />} loading={loading}>Import</Button>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </form>
                    </Stack>
                </Box>
            </Container>
        </div>
    )
}

export default ImportContract