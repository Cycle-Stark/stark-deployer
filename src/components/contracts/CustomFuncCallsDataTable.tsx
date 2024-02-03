import { Button, Badge, useMantineTheme, useMantineColorScheme, Box, ScrollArea } from '@mantine/core'
import { modals } from '@mantine/modals'
import { DataTable } from 'mantine-datatable'
import { isDarkMode } from '../../configs/utils'
import { CodeHighlight } from '@mantine/code-highlight'
import { ReactNode } from 'react'
import RoundedBox from '../common/RoundedBox'
import serialize from 'serialize-javascript'

interface ICustomFuncCallsDataTable {
    page: number
    funcCalls: any[]
    setPage: any
    totalRecords: number
    pageSize: number
}

const CustomFuncCallsDataTable = (props: ICustomFuncCallsDataTable) => {
    const { page, funcCalls, setPage, totalRecords, pageSize } = props
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

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
                    <CodeHighlight language='json' code={serialize(content, { space: 4 })} />
                </RoundedBox>
            )
        }
    }
 
    const openModal = (content: ReactNode, title: string) => {
        return modals.open({
            title,
            children: (
                <>
                    <Box h="400px">
                        <ScrollArea h={'100%'}>
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

    return (
        <DataTable
            bg={isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.violet[1]}
            minHeight={150}
            withTableBorder={false}
            withRowBorders={true}
            rowBorderColor={isDarkMode(colorScheme) ? theme.colors.gray[7] : theme.colors.gray[0]}
            borderRadius={'10px'}
            verticalSpacing={'md'}

            records={funcCalls || []}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(pg) => setPage(pg)}

            totalRecords={totalRecords ?? 0}
            columns={[
                {
                    accessor: 'id',
                    width: '60px',
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
                    title: 'ResultError',
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
    )
}

export default CustomFuncCallsDataTable