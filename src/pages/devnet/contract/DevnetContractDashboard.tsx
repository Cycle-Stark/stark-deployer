import { CodeHighlight } from "@mantine/code-highlight"
import { Group, Title, ActionIcon, Stack, Alert, Grid, Box, Text } from "@mantine/core"
import { IconCode, IconWriting, IconEye, IconTransactionBitcoin } from "@tabler/icons-react"
import { ReactNode, useState, useEffect } from "react"
import CustomFuncCallsDataTable from "../../../components/contracts/CustomFuncCallsDataTable"
import WrapperBox from "../../../components/handy_tools/WrapperBox"
import { db } from "../../../db"
import { useDevnetContractContext } from "../../../providers/DevnetContractProvider"


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
            <Box style={{overflow: "hidden"}}>
                <Text ta={'center'} fw={500} size="62px">{value}</Text>
                <Group justify="space-between" align="center" wrap="nowrap">
                    <Title order={3} size={'16px'} fw={500}>{title}</Title>
                    <ActionIcon size={'50px'} radius={'md'} color={color} variant="light">
                        {icon}
                    </ActionIcon>
                </Group>
            </Box>
        </WrapperBox>
    )
}

const DevnetContractDashboard = () => {
    const { deployment, functions } = useDevnetContractContext()
    // const calls = useLiveQuery(() => db.function_calls.where({ contract_address: deployment?.contract_address ?? '' }).count())

    const [totalRecords, setTotalRecords] = useState(0)
    const [funcCalls, setFuncCalls] = useState<any>([])
    const iconSize = "32px"

    async function loadFuncCalls() {
        try {
            let totalFuncCalls = await db.devnet_function_calls.where({ contract_address: deployment?.contract_address ?? '' }).count()
            setTotalRecords(totalFuncCalls)
            const res = await db.devnet_function_calls.where({ contract_address: deployment?.contract_address ?? '' })
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
                    <CodeHighlight style={{ borderRadius: '10px' }} language="md" code={deployment?.contract_address ?? ""} />
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
                        <SimpleStat title="Calls / Invocations" value={`${totalRecords}`} icon={<IconTransactionBitcoin size={iconSize} />} color="orange" />
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

export default DevnetContractDashboard