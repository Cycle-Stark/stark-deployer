import { Button, Group, Loader, NumberInput, Stack, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useEffect, useState } from "react"
import { Contract } from "starknet"
import { useAppContext } from "../../providers/AppProvider"
import { ERC20_ABI } from "../../configs/config"
import BigNumber from "bignumber.js"
import { showNotification } from "@mantine/notifications"
import { IconChecks, IconInfoCircle } from "@tabler/icons-react"
import WrapperBox from "./WrapperBox"


interface IApproveTool {
    contract_address?: any
    color: string
}

const ApproveTool = (props: IApproveTool) => {

    const { contract_address, color } = props
    const { account } = useAppContext()
    const [loading, setLoading] = useState(false)

    const form = useForm({
        initialValues: {
            token_address: "",
            amount: "",
            decimals: "",
            spender: contract_address ?? '',
        },
        validate: {
            token_address: val => val === "" ? "Token address required!" : null,
            amount: val => val === "" ? "Amount is required!" : null,
            decimals: val => val === "" ? "Token decimals!" : null,
            spender: val => val === "" ? "Spender address required!" : null,
        }
    })

    const calculateValueToCopy = () => {
        if (form.values.decimals === "" || form.values.amount === "") {
            return '0'
        }
        const val = new BigNumber(form.values.amount).multipliedBy(10 ** Number(form.values.decimals)).toNumber()
        return val.toLocaleString(undefined, {useGrouping: false})
    }


    const handleApprove = async () => {
        const amt_to_approve = calculateValueToCopy()
        const ERC20contract = new Contract(ERC20_ABI, form.values.token_address, account)
        const erc20Call = ERC20contract.populate('approve', [form.values.spender, amt_to_approve])

        const multiCall = await account.execute(
            [
                {
                    contractAddress: form.values.token_address,
                    entrypoint: "approve",
                    calldata: erc20Call.calldata
                },
            ]
        )

        account?.provider.waitForTransaction(multiCall.transaction_hash).then(() => {
            showNotification({
                title: "Success",
                message: "Approval successful!",
                color: "green",
                icon: <IconInfoCircle stroke={1.5} />
            })
        }).catch((e: any) => {
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        if (contract_address) {
            form.setFieldValue('spender', contract_address)
        }
    }, [contract_address])

    return (
        <WrapperBox color="violet">
            <Stack>
                <Title order={2} size={'18px'} fw={500}>Approve Token Usage</Title>
                <form onSubmit={form.onSubmit(_values => handleApprove())}>
                    <Stack gap={6}>
                        <TextInput label="Token Address" {...form.getInputProps('token_address')} placeholder="Address" radius={'md'} />
                        <TextInput label="Contract(Spender) Address" {...form.getInputProps('spender')} placeholder="Spender Address" radius={'md'} />
                        <NumberInput label="Amount" {...form.getInputProps('amount')} placeholder="Amount" radius={'md'} hideControls />
                        <NumberInput label="Decimals" {...form.getInputProps('decimals')} placeholder="Decimals" radius={'md'} hideControls />
                        <Group mt={'sm'}>
                            <Button type="submit" radius={'md'} color={color} leftSection={<IconChecks />} rightSection={loading ? <Loader color="white" size={'sm'} /> : null}>
                                Approve
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Stack>
        </WrapperBox>
    )
}

export default ApproveTool