
import { useParams } from 'react-router-dom'
import { useContractContext } from '../../providers/ContractProvider'
import { ReactNode, useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import { Alert, Badge, Box, Button, Group, Loader, ScrollArea, Stack, Text, Title, darken, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { IconCloudUpload, IconDownload } from '@tabler/icons-react'
import { CallDataItem } from '../deploy'
import { CairoCustomEnum } from 'starknet'
import { useAppContext } from '../../providers/AppProvider'
import { JSONSerializer, bigintToLongStrAddressBasedOnType, extractTypeFromString, getLastItemBasedOnSeparator, isDarkMode } from '../../configs/utils'
import { CodeHighlight, InlineCodeHighlight } from '@mantine/code-highlight'
import RoundedBox from '../../components/common/RoundedBox'
import { DataTable } from 'mantine-datatable';
import { db } from '../../db'
import { modals } from '@mantine/modals'
import serialize from 'serialize-javascript'

interface FormValues {
    callData: any[]
}


const FunctionPage = () => {
    const { function_name } = useParams()
    const { contract, get_function_info, connectContract, deployment, contract_address } = useContractContext()
    const [_contract_address, setContractAddress] = useState('')
    const { account, handleConnetWalletBtnClick } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [callResult, setResult] = useState<any | null>(null)
    const [callError, setError] = useState<any | null>(null)
    const [functionInfo, setFunctionInfo] = useState<any | null>(null)
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()
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
                else {
                    entry_obj.valueType = 'felt252'
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

            // const func_call_data = CallData.compile(call_data)
            const myCall = contract.populate(func_name, call_data)
            contract[func_name](myCall.calldata).then((res: any) => {
                setResult(res)
                db.function_calls.add({
                    function_name: func_name,
                    contract_address: contract_address,
                    calldata: form.values.callData,
                    status: 'success',
                    result: res,
                }).then(() => { }).catch(() => { })

            }).catch((err: any) => {
                setError(err)
                db.function_calls.add({
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
            const res = await db.function_calls.where({ function_name: function_name, contract_address: _contract_address }).reverse().toArray();
            setFuncCalls(res)
        } catch (error) {

        }
    }

    const openModal = (content: ReactNode, title: string) => {
        return modals.open({
            title,
            children: (
                <>
                    <Box h="400px">
                        <ScrollArea>
                            {content}
                        </ScrollArea>
                    </Box>
                </>
            ),
            size: 'lg',
            radius: 'lg',
            centered: true,
            // scrollAreaComponent: ScrollArea
        })
    }

    function getContentNode(content: any) {
        if (typeof content === 'string') {
            return (
                <CodeHighlight language='js' code={`${content}`} />
            )
        }
        else if (typeof content === 'bigint') {
            return (
                <CodeHighlight language='js' code={serialize(content)} />
            )
        }
        else {
            return (
                <RoundedBox>
                    <CodeHighlight language='json' code={serialize(content, { space: 4, isJSON: false })} />
                </RoundedBox>
            )
        }
    }

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
                        if (!account) {
                            handleConnetWalletBtnClick()
                        } else if (!contract) {
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
                            <Group justify="start">
                                <Button size="sm" radius={'md'} leftSection={<IconCloudUpload />} type="submit" rightSection={loading ? <Loader color="white" size={'xs'} /> : null}>
                                    {
                                        !account ? "Connect wallet" : !contract ? "Connect Contract" : "Make Call"
                                    }
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Box>
                <DataTable
                    bg={isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.violet[1]}
                    minHeight={150}
                    withTableBorder={false}
                    withRowBorders={true}
                    rowBorderColor={isDarkMode(colorScheme) ? theme.colors.gray[7] : theme.colors.gray[0]}
                    borderRadius={'10px'}
                    verticalSpacing={'md'}
                    records={funcCalls || []}
                    columns={[
                        {
                            accessor: 'id',
                            width: '100px',
                            title: '# ID'
                        },
                        {
                            accessor: 'function_name',
                            title: 'Function',
                            width: '200px'
                        },
                        {
                            accessor: 'calldata',
                            title: 'Call Data',
                            width: '100px',
                            render: (item: any) => (
                                <>
                                    {
                                        item?.calldata.length > 0 ? (
                                            <Button variant='light' color="violet" size='xs' radius={'md'} onClick={() => {
                                                const content = getContentNode(item.calldata)
                                                openModal(content, "Call Data")
                                            }}>
                                                Show
                                            </Button>
                                        ) : '-'
                                    }
                                </>
                            )
                        },
                        {
                            accessor: 'status',
                            width: '100px',
                            title: 'Status',
                            render: item => (
                                <>
                                    {
                                        item?.status === 'success' ? (
                                            <Badge color='green' size='sm' radius={'sm'} variant='light'>SUCCESS</Badge>
                                        ) : (
                                            <Badge color='red' size='sm' radius={'sm'} variant='light'>FAILED</Badge>
                                        )
                                    }
                                </>
                            )
                        },
                        {
                            accessor: 'result',
                            width: '100px',
                            title: 'Result/Error',
                            render: (item: any) => (
                                <>

                                    <Button variant='light' color="violet" size='xs' radius={'md'} onClick={() => {
                                        const content = getContentNode(item?.status === 'success' ? item?.result : item?.error)
                                        openModal(content, item?.status === 'success' ? "Result" : "Error")
                                    }}>
                                        Show
                                    </Button>
                                </>
                            )
                        },
                        // {
                        //     accessor: 'actions',
                        //     width: '100px',
                        //     title: 'Actions'
                        // },
                    ]}
                />
            </Stack>
        </div>
    )
}

export default FunctionPage