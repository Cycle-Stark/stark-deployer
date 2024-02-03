import { Stack, Title, Grid, Select } from "@mantine/core"
import { useState, useEffect } from "react"
import CustomFuncCallsDataTable from "../../../components/contracts/CustomFuncCallsDataTable"
import { db } from "../../../db"
import { useDevnetContractContext } from "../../../providers/DevnetContractProvider"


const DevnetContractTransactions = () => {
    const { contract_address } = useDevnetContractContext()
    const [_contract_address, setContractAddress] = useState('')

    const [totalRecords, setTotalRecords] = useState(0)
    const [funcCalls, setFuncCalls] = useState<any>([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<any>('5')

    async function loadFuncCalls() {
        try {
            let totalFuncCalls = await db.devnet_function_calls.where({ contract_address: contract_address ?? '' }).count()
            setTotalRecords(totalFuncCalls)
            const res = await db.devnet_function_calls.where({ contract_address: contract_address ?? '' })
                .reverse()
                .offset((page - 1) * Number(pageSize))
                .limit(Number(pageSize)).toArray();
            setFuncCalls(res)
        } catch (error) {

        }
    }



    useEffect(() => {
        loadFuncCalls()
    }, [page, pageSize])

    useEffect(() => {
        if (contract_address) {
            setContractAddress(contract_address)
        }
    }, [contract_address])

    return (
        <div>
            <Stack>
                <Title order={1} fw={500}>Function Call/Invoke Logs</Title>
                <Grid>
                    <Grid.Col span={{ md: 2 }}>
                        <Select radius="md" label="Page size" data={[
                            { value: '5', label: '5' },
                            { value: '10', label: '10' },
                            { value: '25', label: '25' },
                            { value: '50', label: '50' },
                        ]} value={pageSize} onChange={val => setPageSize(val)} />
                    </Grid.Col>
                </Grid>
                <CustomFuncCallsDataTable page={page} funcCalls={funcCalls ?? []} setPage={setPage} totalRecords={totalRecords} pageSize={Number(pageSize)} />
            </Stack>
        </div>
    )
}

export default DevnetContractTransactions