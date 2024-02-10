import { ActionIcon, Alert, Box, Grid, Group, Stack, Text, Title } from "@mantine/core"
import { useContractContext } from "../../providers/ContractProvider"
import { CodeHighlight } from "@mantine/code-highlight"
import WrapperBox from "../../components/handy_tools/WrapperBox"
import { IconCode, IconEye, IconTransactionBitcoin, IconWriting } from "@tabler/icons-react"
import { ReactNode, useEffect, useState } from "react"
import { db } from "../../db"
import CustomFuncCallsDataTable from "../../components/contracts/CustomFuncCallsDataTable"

interface ISimpleStat {
    title: string
    value: string
    icon: ReactNode
    color: string
}

const SimpleStat = (props: ISimpleStat) => {
    const { title, value, icon, color } = props

    return (
        <WrapperBox color={color}>
            <Text ta={'center'} fw={500} size="62px">{value}</Text>
            <Group justify="space-between">
                <Title order={3} size={'18px'} fw={500}>{title}</Title>
                <ActionIcon size={'50px'} radius={'md'} color={color} variant="light">
                    {icon}
                </ActionIcon>
            </Group>
        </WrapperBox>
    )
}

const ContractDashboard = () => {
    const { deployment, functions } = useContractContext()
    // const calls = useLiveQuery(() => db.function_calls.where({ contract_address: deployment?.contract_address ?? '' }).count())

    const [totalRecords, setTotalRecords] = useState(0)
    const [funcCalls, setFuncCalls] = useState<any>([])
    const iconSize = "32px"



    async function loadFuncCalls() {
        try {
            let totalFuncCalls = await db.function_calls.where({ contract_address: deployment?.contract_address ?? '' }).count()
            setTotalRecords(totalFuncCalls)
            const res = await db.function_calls.where({ contract_address: deployment?.contract_address ?? '' })
                .reverse()
                .limit(10).toArray();
            setFuncCalls(res)
        } catch (error) {

        }
    }

    useEffect(() => {
        loadFuncCalls()
    }, [deployment])

    return (
        <div>
            <Stack gap={20}>
                <Title>{deployment?.name}</Title>
                <Text size="sm" c="dimmed">Date added: {deployment?.date}</Text>
                <Alert title="Contract Address" radius={'md'}>
                    <Box w={'100%'}>
                        <CodeHighlight withCopyButton={true} style={{ borderRadius: '10px' }} language="md" code={deployment?.contract_address ?? ""} />
                    </Box>
                </Alert>
                <Grid>
                    <Grid.Col span={{ md: 3 }}>
                        <SimpleStat title="Functions" value={`${functions?.length}`} icon={<IconCode size={iconSize} />} color="indigo" />
                    </Grid.Col>
                    <Grid.Col span={{ md: 3 }}>
                        <SimpleStat title="Write Functions" value={`${functions?.filter((func: any) => func?.state_mutability === "external")?.length}`} icon={<IconWriting size={iconSize} />} color="green" />
                    </Grid.Col>
                    <Grid.Col span={{ md: 3 }}>
                        <SimpleStat title="Read Functions" value={`${functions?.filter((func: any) => func?.state_mutability === "view")?.length}`} icon={<IconEye size={iconSize} />} color="darkBlue" />
                    </Grid.Col>
                    <Grid.Col span={{ md: 3 }}>
                        <SimpleStat title="Calls/Invocations" value={`${totalRecords}`} icon={<IconTransactionBitcoin size={iconSize} />} color="orange" />
                    </Grid.Col>
                </Grid>
                <Box>
                    <Title order={2} mb={'sm'}>Recent Calls/Invocations</Title>
                    <CustomFuncCallsDataTable page={1} funcCalls={funcCalls ?? []} setPage={(_v: any) => { }} totalRecords={10} pageSize={10} />
                </Box>
            </Stack>
        </div>
    )
}

export default ContractDashboard