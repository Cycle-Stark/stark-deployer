import { Button, Badge, useMantineColorScheme, useMantineTheme, Box } from '@mantine/core'
import { modals } from '@mantine/modals'
import { DataTable } from 'mantine-datatable'
import { isDarkMode } from '../../../configs/utils'
import { CodeHighlight } from '@mantine/code-highlight'
import { ReactNode } from 'react'
import RoundedBox from '../../../components/common/RoundedBox'
import serialize from 'serialize-javascript'


const FuncCallsTable = ({ funcCalls }: { funcCalls: any }) => {
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    const openModal = (content: ReactNode, title: string) => {
        return modals.openConfirmModal({
            title,
            children: (
                <>
                    <Box>
                        {content}
                    </Box>
                </>
            ),
            labels: {
                cancel: 'Cancel',
                confirm: 'Confirm'
            },
            size: 'lg',
            radius: 'lg',
            centered: true,
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
    
    return (
        <>
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
                                    return openModal(content, item?.status === 'success' ? "Result" : "Error")
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
        </>
    )
}

export default FuncCallsTable