import { useSnapshot } from "valtio"
import appState from "../configs/storage"
import { ActionIcon, Box, Button, Code, Container, Divider, FileInput, Grid, Group, Loader, NumberInput, Select, Stack, Text, TextInput, Title, useMantineColorScheme } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconAlertTriangle, IconCheck, IconCloudUpload, IconInfoCircle, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { useAppContext } from "../providers/AppProvider"
import { useEffect, useState } from "react"
import { CairoCustomEnum, CallData, DeclareContractPayload, hash } from "starknet"
import { showNotification } from "@mantine/notifications"
import { isDarkMode } from "../configs/utils"
import Deployments from "../components/app/Deployments"
import { modals } from "@mantine/modals"
import { CodeHighlight } from '@mantine/code-highlight';
import { readFileAsString } from "../configs/readAsFileString"
import { db } from "../db"

// Infura: https://starknet-goerli.infura.io/v3/958e1b411a40480eacb8c0f5d640a8ec
// Sepolia: https://starknet-sepolia.infura.io/v3/936b5b98923b44289fa0dd1154d85f00

interface ICallDataItem {
    valueType: string
    value: any
    form: any
    index: any
    deleteCallDataObj: any
    hideDeleteBtn?: boolean
}

export const CallDataItem = (props: ICallDataItem) => {
    const { valueType, form, index, deleteCallDataObj, hideDeleteBtn } = props
    const radius = "md"
    return (
        <Grid>
            <Grid.Col span={{ md: hideDeleteBtn ? 12 : 11 }}>
                <Grid>
                    <Grid.Col span={{ md: 4 }}>
                        <TextInput disabled={hideDeleteBtn} radius={radius} label="Key" {...form.getInputProps(`callData.${index}.key_`)} placeholder="gurdian" />
                    </Grid.Col>
                    <Grid.Col span={{ md: 4 }}>
                        <Select radius={radius} disabled={hideDeleteBtn} label="Type" data={[
                            { value: 'number', label: 'Number' },
                            { value: 'felt', label: 'Felt' },
                            { value: 'address', label: 'Address' },
                            { value: 'bool', label: 'Boolean' },
                            { value: 'enum', label: 'Enum' },
                        ]} {...form.getInputProps(`callData.${index}.valueType`)} />
                    </Grid.Col>
                    <Grid.Col span={{ md: 4 }} >
                        {/* {form.values.CallData[index].valueType} */}
                        {
                            valueType === 'felt' ? (
                                <TextInput radius={radius} label="Value" {...form.getInputProps(`callData.${index}.value`)} placeholder="Some string information" />
                            ) : null
                        }
                        {
                            valueType === 'address' ? (
                                <TextInput radius={radius} label="Value" {...form.getInputProps(`callData.${index}.value`)} placeholder="0xAB5..." />
                            ) : null
                        }
                        {
                            valueType === 'number' ? (
                                <NumberInput radius={radius} label="Value" {...form.getInputProps(`callData.${index}.value`)} placeholder="2000000" />
                            ) : null
                        }
                        {
                            valueType === 'bool' ? (
                                <Select radius={radius} label="value" {...form.getInputProps(`callData.${index}.value`)} data={[
                                    { value: 'true', label: 'True' },
                                    { value: 'false', label: 'False' },
                                ]} placeholder="True" />
                            ) : null
                        }
                        {
                            valueType === 'enum' ? (
                                <TextInput radius={radius} label="Value" {...form.getInputProps(`callData.${index}.value`)} placeholder="Category" />
                            ) : null
                        }
                    </Grid.Col>
                </Grid>
            </Grid.Col>
            <Grid.Col span={{ md: 1 }} hidden={hideDeleteBtn}>
                <Group className="h-100" align="flex-end">
                    <ActionIcon variant="filled" color="red" radius={'md'} size={'lg'} onClick={() => deleteCallDataObj(index)}>
                        <IconTrash />
                    </ActionIcon>
                </Group>
            </Grid.Col>
        </Grid>
    )
}

const callDataObj = {
    key_: '',
    valueType: 'felt',
    value: '',
}

interface FormValues {
    contractName: string
    casmFile: File | null
    sierraFile: File | null
    callData: any[]
}

const Deploy = () => {
    const {  account, chainId, connection } = useAppContext()
    const [loading, setLoading] = useState(false)
    const { colorScheme } = useMantineColorScheme()
    const [classHash, setClassHash] = useState<string | null>(null)

    const snap = useSnapshot(appState, { sync: true })

    const form = useForm<FormValues>({
        initialValues: {
            contractName: "Contract name",
            casmFile: null,
            sierraFile: null,
            callData: []
        },
        validate: {
            casmFile: val => val === null ? "CASM is required!" : null,
            sierraFile: val => val === null ? "Sierra is required!" : null,
            callData: {
                key_: val => {
                    if (val === '') {
                        return "Required"
                    }
                    return null
                },
                value: val => {
                    if (val === '') {
                        return "Required"
                    }
                    return null
                },
            }
        }
    })

    const addNewCallDataObj = () => {
        form.insertListItem('callData', callDataObj)
    }

    const deleteCallDataObj = (index: number) => {
        form.removeListItem('callData', index)
    }


    const handleDeclare = async () => {
        if (!account) {
            showNotification({
                message: "Please connect your wallet!",
                color: 'red',
                icon: <IconAlertTriangle />
            })
            return
        }
        setLoading(true)
        setClassHash(null)

        const sierraAsString = await readFileAsString(form.values.sierraFile as File)
        const casmAsString = await readFileAsString(form.values.casmFile as File)
        const casm = JSON.parse(casmAsString)
        const classHash = hash.computeContractClassHash(sierraAsString)
        const compiledClassHash = hash.computeCompiledClassHash(casm)

        const payload: DeclareContractPayload = {
            contract: JSON.parse(sierraAsString),
            casm,
            classHash,
            compiledClassHash
        }

        connection.account.declareIfNot(payload).then((res: any) => {
            setClassHash(res?.class_hash)
        }).catch((err: any) => {
            showNotification({
                message: `Failed to Declare: ${err}`,
                color: 'red',
                icon: <IconAlertTriangle />
            })
            setClassHash(null)
        })
        setLoading(false)
    }


    async function deployContract() {
        setLoading(true)
        const call_data: any = {}
        const form_call_data = form.values.callData
        if (form.values.callData.length > 0) {
            for (let i = 0; i < form_call_data.length; i++) {
                const cd = form_call_data[i];
                if (cd['valueType'] === 'bool') {
                    call_data[cd['key_']] = cd['value'] === 'true' ? true : false
                } else if (cd['valueType'] === 'enum') {
                    call_data[cd['key_']] = new CairoCustomEnum({ [cd['value']]: {} })
                }
                else {
                    call_data[cd['key_']] = cd['value']
                }
            }
        }

        const sierraAsString = await readFileAsString(form.values.sierraFile as File)
        const casmAsString = await readFileAsString(form.values.casmFile as File)
        const casm = JSON.parse(casmAsString)

        const contractConstructor = CallData.compile(call_data)

        account.declareAndDeploy({ contract: sierraAsString, casm, constructorCalldata: contractConstructor }).then((res: any) => {
            const currentTime = new Date()

            // const resp = { ...res, date: `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()}`, chainId: chainId }
            // if (snap?.deployments) {
            //     appState.deployments.push(resp)
            // }
            // else {
            //     appState.deployments = [resp]
            // }

            db.contracts.add({
                name: form.values.contractName,
                tx_info: res,
                date: `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()}`,
                chainId: chainId,
                contract_address: res?.deploy?.address,
                abi: JSON.parse(sierraAsString)
            }).then((res) => {
                showNotification({
                    message: `New Contract saved with ID: ${res}`,
                    color: "green",
                    icon: <IconCheck />
                })
            }).catch((err: any) => {
                showNotification({
                    message: `Unable to save the new contract: ${err}`,
                    color: "red",
                    icon: <IconX />
                })
            })

            form.reset()
            setClassHash(null)
        }).catch((err: any) => {
            showNotification({
                message: `Failed to Deploy: ${err}`,
                color: 'red',
                icon: <IconAlertTriangle />,
                variant: 'light'
            })
            setClassHash(null)
        }).finally(() => {
            setLoading(false)
            setClassHash(null)
        })

    }
    const EnumCode = `
#[derive(Drop)]
enum Direction {
    North: (),
    East: (),
    South: felt252,
    West: (u32, u32),
}`

    const openCallDataInfoModal = () => modals.open({
        title: "More Information",
        centered: true,
        size: 'lg',
        radius: 'lg',
        children: (
            <>
                <Stack gap={10}>
                    <Text size="sm">Enum Types are the simple empty Enum. If you have complex Enum type, it might difficult to go through this setup.</Text>
                    <CodeHighlight language="rust" code={EnumCode} />
                    <Text size="sm">
                        <Code>North</Code> & <Code>East</Code> will work well but <Code>South</Code> & <Code>West</Code> will fail.
                    </Text>
                </Stack>
            </>
        )
    })

    useEffect(() => {
        // console.log("Invoked")
        if (classHash) {
            // console.log("Starting deployment")
            deployContract()
        }
    }, [classHash])

    // useEffect(() => {
    //     // console.log(connection)
    // }, [])


    return (
        <div>
            <Container size={"md"}>
                <Stack>
                    <TextInput label="Connected RPC Endpoint" disabled radius={'md'} value={snap.rpcEndpoint} />
                    <Deployments />
                    <Divider />
                    <Box p="lg" style={theme => ({
                        background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
                        borderRadius: theme.radius.lg
                    })}>
                        <Stack>
                            <Title order={3}>New Deployment</Title>
                            <form onSubmit={form.onSubmit(_values => handleDeclare())}>
                                <Grid>
                                <Grid.Col span={{ md: 12 }} >
                                        <TextInput radius={'md'} placeholder="My Contract" label="Contract Name" {...form.getInputProps('contractName')} />
                                    </Grid.Col>
                                    <Grid.Col span={{ md: 6 }} >
                                        <FileInput radius={'md'} placeholder="contract.compiled_contract_class.json" label="Casm file" {...form.getInputProps('casmFile')} />
                                    </Grid.Col>
                                    <Grid.Col span={{ md: 6 }}>
                                        <FileInput radius={'md'} placeholder="contract.contract_class.json" label="Sierra file" {...form.getInputProps('sierraFile')} />
                                    </Grid.Col>
                                    <Grid.Col span={{ md: 12 }}>
                                        <Stack gap={10}>
                                            <Group align="center" gap={6}>
                                                <Text fw={500}>Call Data</Text>
                                                <ActionIcon onClick={openCallDataInfoModal} variant="transparent" size={'sm'}>
                                                    <IconInfoCircle />
                                                </ActionIcon>
                                            </Group>
                                            {
                                                form.values.callData.length === 0 ? 'No Call Data' : null
                                            }
                                            {
                                                form.values.callData.map((item: any, i: number) => (
                                                    <CallDataItem key={`item_${i}`} {...item} form={form} index={i} deleteCallDataObj={deleteCallDataObj} />
                                                ))
                                            }
                                            <Group>
                                                <Button size="xs" radius={'md'} leftSection={<IconPlus />} onClick={addNewCallDataObj}>Add</Button>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={{ md: 12 }}>
                                        <Group justify="center">
                                            <Button size="sm" radius={'md'} leftSection={<IconCloudUpload />} type="submit" rightSection={loading ? <Loader color="white" size={'xs'} /> : null}>Deploy</Button>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                            </form>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </div>
    )
}

export default Deploy

