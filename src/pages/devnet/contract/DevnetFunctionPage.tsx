import { CodeHighlight, InlineCodeHighlight } from '@mantine/code-highlight'
import { useMantineColorScheme, Box, Stack, Title, Group, Alert, darken, Button, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDownload, IconCloudUpload } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import RoundedBox from '../../../components/common/RoundedBox'
import { getLastItemBasedOnSeparator, extractTypeFromString, isDarkMode, bigintToLongStrAddressBasedOnType, JSONSerializer } from '../../../configs/utils'
import { db } from '../../../db'
import { CallDataItem } from '../../deploy'
import { useDevnetContractContext } from '../../../providers/DevnetContractProvider'
import { useDevnetContext } from '../../../providers/DevnetProvider'
import FuncCallsTable from './FuncCallsTable'

// import { json } from 'starknet'

interface FormValues {
    callData: any[]
}


const DevnetFunctionPage = () => {
    const { function_name } = useParams()
    const { contract, get_function_info, connectContract, deployment, contract_address } = useDevnetContractContext()
    const { account } = useDevnetContext()
    const [_contract_address, setContractAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [callResult, setResult] = useState<any | null>(null)
    const [callError, setError] = useState<any | null>(null)
    const [functionInfo, setFunctionInfo] = useState<any | null>(null)
    const [sourceCode, setSourceCode] = useState<any>(null)

    const { colorScheme } = useMantineColorScheme()

    const [funcCalls, setFuncCalls] = useState<any>([])

    const form = useForm<FormValues>({
        initialValues: {
            callData: []
        },
        validate: {
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

    const deleteCallDataObj = (_index: number) => {
        // form.removeListItem('callData', index)
    }

    function addAllCallDataEntries(inputs: any[]) {
        if (inputs?.length > 0) {
            inputs?.map((entry: any) => {
                let _type: any = getLastItemBasedOnSeparator(entry?.type ?? "", "::")
                const entry_obj = {
                    key_: entry?.name,
                    valueType: 'felt',
                    value: '',
                }
                if (_type === "u8" || _type === "u32" || _type === "u64" || _type === "u128" || _type === "u256") {
                    entry_obj.valueType = 'number'
                    form.insertListItem('callData', entry_obj)
                }
                else if (_type === "felt252") {
                    entry_obj.valueType = 'felt'
                    form.insertListItem('callData', entry_obj)
                }
                else if (_type === "ContractAddress") {
                    entry_obj.valueType = 'address'
                    form.insertListItem('callData', entry_obj)
                }
                else if (_type === "bool") {
                    entry_obj.valueType = 'bool'
                    form.insertListItem('callData', entry_obj)
                }
                else {
                    entry_obj.valueType = 'felt'
                    form.insertListItem('callData', entry_obj)
                }
            })
        }
    }

    function callFunc() {
        setLoading(true)
        setResult(null)
        setError(null)
        if (contract) {
            const func_name: any = function_name

            const myCall = contract.populate(func_name, form.values.callData.map((item: any) => item.value))

            contract[func_name](myCall.calldata, { parseResponse: true }).then((res: any) => {
                setResult(res)
                db.devnet_function_calls.add({
                    function_name: func_name,
                    contract_address: contract_address,
                    calldata: form.values.callData,
                    status: 'success',
                    result: res,
                }).then(() => { }).catch(() => { })

            }).catch((err: any) => {
                setError(err)
                db.devnet_function_calls.add({
                    function_name: func_name,
                    contract_address: contract_address,
                    calldata: form.values.callData,
                    status: 'fail',
                    error: `${err}`,
                }).then(() => { }).catch(() => { })
            }).finally(() => {
                setLoading(false)
                loadFuncCalls()
            })

        }
    }

    const loadFuncInfo = () => {
        const func_name: any = function_name
        if (func_name) {
            const func = get_function_info(func_name)
            setFunctionInfo(func)
        }
    }

    function resetPage() {
        form.reset()
        setLoading(false)
        setResult(null)
        setError(null)
        setFunctionInfo(null)
    }

    function loadFuncParams() {
        let params = ''
        functionInfo?.inputs.map((input: any, i: number) => {
            let itype = getLastItemBasedOnSeparator(input?.type ?? "", "::")
            if (i === functionInfo?.inputs.length - 1) {
                params += `${input.name}: ${itype}`
            }
            else {
                params += `${input.name}: ${itype}, `
            }
        })
        return params
    }

    function makeCode() {
        const array_calldata = form.values.callData.map((item: any) => item.value)
        const code = `
const makeInteraction = () => {
    const myCall = contract.populate('${function_name}', ${JSON.stringify(array_calldata)})
    setLoading(true)
    contract['${function_name}'](myCall.calldata).then((res: any) => {
        console.info("Successful Response:", res)
    }).catch((err: any) => {
        console.error("Error: ", err)
    }).finally(() => {
        setLoading(false)
    })
}
        `
        setSourceCode(code)
    }

    function loadFuncReturnTypes() {
        let output = ''
        if (functionInfo?.outputs?.length === 1) {
            let _output = functionInfo?.outputs[0]
            let isArrayType = extractTypeFromString(_output.type)
            let otype = isArrayType ? `${isArrayType}[]` : getLastItemBasedOnSeparator(_output?.type ?? "", "::")
            output += `${otype}`
        }
        return output
    }

    async function loadFuncCalls() {
        try {
            const res = await db.devnet_function_calls.where({ function_name: function_name, contract_address: _contract_address }).reverse().toArray();
            setFuncCalls(res)
        } catch (error) {

        }
    }

    useEffect(() => {
        makeCode()
    }, [form.values.callData])

    useEffect(() => {
        resetPage()
        loadFuncInfo()
        loadFuncCalls()
    }, [function_name, contract_address])

    useEffect(() => {
        if (functionInfo) {
            addAllCallDataEntries(functionInfo?.inputs)
        }
    }, [functionInfo])

    useEffect(() => {
        if (contract_address) {
            setContractAddress(contract_address)
        }
    }, [contract_address])

    return (
        <div>
            <Stack>
                <Title order={2}> {function_name ?? "not loaded"}</Title>
                <Text>Inputs: {functionInfo?.inputs?.length}</Text>
                <Text>Function Signature: <InlineCodeHighlight
                    code={`${function_name}(${loadFuncParams()}) return ${loadFuncReturnTypes()}`}
                    language='ts' />
                </Text>
                <Box p={'xs'} style={theme => ({
                    background: isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.gray[0],
                    borderRadius: theme.radius.md
                })}>
                    <form onSubmit={form.onSubmit(_values => {
                        if (!contract) {
                            connectContract()
                        }
                        else {
                            callFunc()
                        }
                    })}>
                        <Stack>
                            <Box hidden={functionInfo?.inputs?.length === 0}>
                                <Stack gap={10}>
                                    <Group align="center" gap={6}>
                                        <Text fw={500}>Call Data</Text>
                                    </Group>
                                    {
                                        form.values.callData.map((item: any, i: number) => (
                                            <CallDataItem key={`item_${i}`} {...item} form={form} index={i} deleteCallDataObj={deleteCallDataObj} hideDeleteBtn={true} />
                                        ))
                                    }

                                </Stack>
                            </Box>
                            {
                                callResult !== null ? (
                                    <Box>
                                        <Alert variant="light" color="green" title="Successful Result" icon={<IconDownload />}>
                                            {
                                                typeof callResult === 'string' ? (
                                                    <Text>
                                                        {`${callResult}`}
                                                    </Text>
                                                ) :
                                                    typeof callResult === 'bigint' ? (
                                                        <Text>
                                                            {`${bigintToLongStrAddressBasedOnType(callResult, functionInfo)}`}
                                                        </Text>
                                                    ) :
                                                        <RoundedBox><CodeHighlight language='json' code={JSONSerializer(callResult, functionInfo, deployment?.abi)} /></RoundedBox>
                                            }
                                        </Alert>
                                    </Box>
                                ) : null
                            }
                            <Box hidden={callError === null}>
                                <Box p="xs" style={theme => ({
                                    background: darken(theme.colors.red[6], 0.8),
                                    borderRadius: theme.radius.md
                                })}>
                                    <Text c="white" size='sm' style={{ wordWrap: 'break-word', textWrap: 'wrap' }} w={'100%'}>
                                        {`${callError}`}
                                    </Text>
                                </Box>
                            </Box>
                            <Box>
                                <CodeHighlight language='ts' code={sourceCode ?? ''} style={{
                                    borderRadius: '20px'
                                }} />
                            </Box>
                            <Group justify="start" py="md">
                                <Button size="sm" radius={'md'} leftSection={<IconCloudUpload />} type="submit" rightSection={loading ? <Loader color="white" size={'xs'} /> : null}>
                                    {
                                        !account ? "Connect wallet" : !contract ? "Connect Contract" : "Make Call"
                                    }
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Box>
                <FuncCallsTable funcCalls={funcCalls} />
            </Stack>
        </div>
    )
}

export default DevnetFunctionPage