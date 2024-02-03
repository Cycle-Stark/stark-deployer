import { useMantineColorScheme, Box, Stack, Title, Grid, TextInput, FileInput, Group, ActionIcon, Button, Loader, Text, Code, Container } from "@mantine/core"
import { useForm } from "@mantine/form"
import { showNotification } from "@mantine/notifications"
import { IconAlertTriangle, IconCheck, IconX, IconInfoCircle, IconPlus, IconCloudUpload } from "@tabler/icons-react"
import { useState } from "react"
import { CairoCustomEnum, CallData, Calldata } from "starknet"
import { readFileAsString } from "../../configs/readAsFileString"
import { isDarkMode } from "../../configs/utils"
import { db } from "../../db"
import { CallDataItem } from "../deploy"
import { modals } from "@mantine/modals"
import { CodeHighlight } from "@mantine/code-highlight"
import { useDevnetContext } from "../../providers/DevnetProvider"
import BigNumber from "bignumber.js"


// const _signMessageTogetSignature = (account: any, message: string, skipDeploy: boolean) => {
//     return account.signMessage(
//         {
//             domain: {
//                 name: "Example DApp",
//                 chainId: 'SN_GOERLI',
//                 version: "0.0.1",
//             },
//             types: {
//                 StarkNetDomain: [
//                     { name: "name", type: "felt" },
//                     { name: "chainId", type: "felt" },
//                     { name: "version", type: "felt" },
//                 ],
//                 Message: [{ name: "message", type: "felt" }],
//             },
//             primaryType: "Message",
//             message: {
//                 message,
//             },
//         },
//         // @ts-ignore
//         { skipDeploy },
//     )
// }

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

const DeployContract = () => {

    const { account } = useDevnetContext()

    const [loading, setLoading] = useState(false)
    const { colorScheme } = useMantineColorScheme()
    const [classHash, setClassHash] = useState<string | null>(null)

    // console.log(account, provider)

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

        console.log(account)
        // if (!account) {
        //     showNotification({
        //         message: "Please connect your wallet!",
        //         color: 'red',
        //         icon: <IconAlertTriangle />
        //     })
        //     return
        // }
        setLoading(true)
        setClassHash(null)

        const sierraAsString = await readFileAsString(form.values.sierraFile as File)
        const casmAsString = await readFileAsString(form.values.casmFile as File)
        const casm = JSON.parse(casmAsString)
        // const _classHash = hash.computeContractClassHash(sierraAsString)
        // const compiledClassHash = hash.computeCompiledClassHash(casm)

        // const sign: Signature = await signMessageTogetSignature(account, "DECLARE", false)
        // console.log(address)

        const payload: any = {
            contract: JSON.parse(sierraAsString),
            casm,
            // senderAddress: address,
            // signature: sign,
            // _classHash,
            // compiledClassHash
        }


        // console.log(sign)
        account.declareIfNot(payload, { maxFee: BigNumber(1).multipliedBy(10 ** 18).toString() }).then((res: any) => {
            console.log("Res: ", res)
            setClassHash(res?.class_hash)
        }).catch((err: any) => {
            console.log("Error: ", err)
            // showNotification({
            //     message: `Failed to Declare: ${err}`,
            //     color: 'red',
            //     icon: <IconAlertTriangle />
            // })
            setClassHash(null)
        })

        // account.declareAndDeploy({ contract: sierraAsString, casm: casmAsString, classHash: _classHash, compiledClassHash }).then((res: any) => {
        //     console.log("Results: ", res)
        // }).catch((err: any) => {
        //     console.log("Error: ", err)
        // })

        setLoading(false)
    }


    async function deployContract() {
        setLoading(true)
        const call_data: any = {}
        const new_call_data: any = []
        const form_call_data = form.values.callData
        if (form.values.callData.length > 0) {
            for (let i = 0; i < form_call_data.length; i++) {
                const cd = form_call_data[i];
                if (cd['valueType'] === 'bool') {
                    call_data[cd['key_']] = cd['value'] === 'true' ? true : false
                    new_call_data.push(cd['value'] === 'true' ? 'true' : 'false')
                } else if (cd['valueType'] === 'enum') {
                    call_data[`${cd['key_']}`] = new CairoCustomEnum({ [cd['value']]: {} })
                    new_call_data.push(new CairoCustomEnum({ [cd['value']]: {} }))
                }
                else if(cd['valueType'] === 'number') {
                    call_data[`${cd['key_']}`] = BigNumber(cd['value']).toNumber()
                    new_call_data.push(cd['value'])
                }
                else {
                    call_data[`${cd['key_']}`] = cd['value']
                    new_call_data.push(cd['value'])
                }
            }
        }

        const sierraAsString = await readFileAsString(form.values.sierraFile as File)
        // const casmAsString = await readFileAsString(form.values.casmFile as File)
        // const casm = JSON.parse(casmAsString) 


        const contractCallData: CallData = new CallData(JSON.parse(sierraAsString).abi);
        console.log(call_data)
        const contractConstructor: Calldata = contractCallData.compile("constructor", new_call_data);


        // const contractConstructor = CallData.compile(new_call_data)
        // const compiledClassHash = hash.computeCompiledClassHash(casm)

        // console.log(classHash)
        // account?.declareAndDeploy({ contract: sierraAsString, compiledClassHash: compiledClassHash, constructorCalldata: contractConstructor }).then((res: any) => {
        account?.deployContract([{ classHash: classHash, constructorCalldata: contractConstructor }]).then((res: any) => {
            const currentTime = new Date()

            // const resp = { ...res, date: `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()}`, chainId: chainId }
            // if (snap?.deployments) {
            //     appState.deployments.push(resp)
            // }
            // else {
            //     appState.deployments = [resp]
            // }

            console.log("Devnet contract deployment: ", res)

            db.devnet_contracts.add({
                name: form.values.contractName,
                tx_info: { ...res, class_hash: classHash, call_data },
                date: `${currentTime.toDateString()} ${currentTime.toLocaleTimeString()}`,
                chainId: 'Devnet',
                contract_address: res?.contract_address[0],
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
            console.log("Error: ", err)
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

    return (
        <Container size={'xxl'} py="lg">
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
                                    <Button size="sm" radius={'md'} leftSection={<IconCloudUpload />} type="submit" rightSection={loading ? <Loader color="white" size={'xs'} /> : null}>Declare</Button>
                                    {
                                        classHash ?
                                            <Button size="sm" radius={'md'} leftSection={<IconCloudUpload />} type="button" onClick={deployContract} rightSection={loading ? <Loader color="white" size={'xs'} /> : null}>Deploy</Button>
                                            :
                                            null
                                    }
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </form>
                </Stack>
            </Box>
        </Container>
    )
}

export default DeployContract
