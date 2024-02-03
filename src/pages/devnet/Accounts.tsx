import { DataTable } from "mantine-datatable"
import { Button, Container, Group, Indicator, Stack, Text, Title } from "@mantine/core"
import CustomCopyBtn from "../../components/handy_tools/CustomCopyBtn"
import { limitChars } from "../../configs/utils"
import BigNumber from "bignumber.js"
import { useDevnetContext } from "../../providers/DevnetProvider"


const Accounts = () => {

    const { accounts, address, connectAccount } = useDevnetContext()

    return (
        <Container size={'xxl'} py={'lg'}>
            <Stack>
                <Title>Accounts</Title>
                <DataTable
                    withTableBorder={false}
                    records={accounts}
                    borderRadius={'lg'}
                    minHeight={150}
                    verticalSpacing={'md'}
                    columns={[
                        {
                            accessor: 'id',
                            width: "80px",
                            render: (_record, index) => (
                                <>
                                    {index + 1}
                                </>
                            ),
                        },
                        {
                            accessor: "initial_balance",
                            width: "250px",
                            render: (item) => (
                                <Text size="sm" c="dimmed">{BigNumber(item.initial_balance).dividedBy(10 ** 18).decimalPlaces(4).toString()} ETH</Text>
                            )
                        },
                        {
                            accessor: "address",
                            width: "300px",
                            render: (item) => (
                                <Group>
                                    <CustomCopyBtn color={"blue"} copy_value={item.address} />
                                    <Text size="sm" c="dimmed">
                                        {limitChars(item.address, 20, true)}
                                    </Text>
                                </Group>
                            )
                        },
                        {
                            accessor: "public_key",
                            width: "300px",
                            render: (item) => (
                                <Group>
                                    <CustomCopyBtn color={"blue"} copy_value={item.public_key} />
                                    <Text size="sm" c="dimmed">
                                        {limitChars(item.public_key, 20, true)}
                                    </Text>
                                </Group>
                            )
                        },
                        {
                            accessor: "private_key",
                            width: "300px",
                            render: (item) => (
                                <Group>
                                    <CustomCopyBtn color={"blue"} copy_value={item.private_key} />
                                    <Text size="sm" c="dimmed">
                                        {limitChars(item.private_key, 20, true)}
                                    </Text>
                                </Group>
                            )
                        },
                        {
                            accessor: "actions",
                            width: "140px",
                            render: (item, index) => (
                                <Group>
                                    {
                                        address === item?.address ? (
                                            <Button size="xs" radius={'md'} leftSection={<Indicator color={'green'} />} color="green" variant="light">
                                                Connected
                                            </Button>
                                        ) : (
                                            <Button onClick={() => connectAccount(index)} size="xs" radius={'md'} leftSection={<Indicator color={'yellow'} />} color="yellow" variant="outline">
                                                Connect
                                            </Button>
                                        )
                                    }
                                </Group>
                            )
                        }
                    ]}
                />
            </Stack>
        </Container>
    )
}

export default Accounts