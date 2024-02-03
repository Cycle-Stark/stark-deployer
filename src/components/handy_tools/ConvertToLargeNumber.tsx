import { Grid, NumberInput, Stack, Title } from "@mantine/core"
import WrapperBox from "./WrapperBox"
import { useForm } from "@mantine/form"
import BigNumber from "bignumber.js"
import CustomCopyBtn from "./CustomCopyBtn"


interface IConvertToLargeNumber {
    color: string
}

const ConvertToLargeNumber = (props: IConvertToLargeNumber) => {
    const { color } = props
    const form = useForm({
        initialValues: {
            value: "",
            decimals: ""
        }
    })

    const calculateValueToCopy = () => {
        if (form.values.decimals === "" || form.values.value === "") {
            return '0'
        }
        const val = new BigNumber(form.values.value).multipliedBy(10 ** Number(form.values.decimals)).toNumber()
        return val.toLocaleString(undefined, { useGrouping: false })
    }

    return (
        <WrapperBox color={color}>
            <Stack>
                <Title order={2} size={'18px'} fw={500}>Create Large Numbers</Title>
                <Grid>
                    <Grid.Col span={7}>
                        <NumberInput radius={'md'} label="Amount" {...form.getInputProps('value')} hideControls placeholder="10" />
                    </Grid.Col>
                    <Grid.Col span={5}>
                        <NumberInput radius={'md'} label="Decimals" {...form.getInputProps('decimals')} hideControls placeholder="18" />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <NumberInput radius={'md'} label="Result" value={calculateValueToCopy() ?? ''} hideControls rightSection={<CustomCopyBtn color={color} copy_value={calculateValueToCopy()} />} />
                    </Grid.Col>
                </Grid>
            </Stack>
        </WrapperBox>
    )
}

export default ConvertToLargeNumber