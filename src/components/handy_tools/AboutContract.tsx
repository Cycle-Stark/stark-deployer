import { useEffect, useState } from 'react'
import WrapperBox from './WrapperBox'
import { Button, Group, Loader, Stack, TextInput, Title } from '@mantine/core'
import { useContractContext } from '../../providers/ContractProvider'
import { useForm } from '@mantine/form'
import CustomCopyBtn from './CustomCopyBtn'
import { IconWriting } from '@tabler/icons-react'
import { db } from '../../db'

interface IAboutContract {
    color: string
}

const AboutContract = (props: IAboutContract) => {
    const { color } = props
    const { contract_address, deployment, contract_id } = useContractContext()
    const [loading, setLoading] = useState(false)

    const form = useForm({
        initialValues: {
            name: "",
        },
    })

    const handleUpdate = () => {
        setLoading(true)
        const id: any = contract_id
        if (id) {
            db.contracts.update(Number(id), { ...form.values }).then((_res: any) => {
            }).catch((_err: any) => {
            }).finally(() => {
                setLoading(false)
            })
        }
    }

    useEffect(() => {
        if (deployment) {
            form.setFieldValue('name', deployment.name)
        }
    }, [deployment])

    return (
        <WrapperBox color={color}>
            <Stack gap={6}>
                <Title order={2} size={'18px'} fw={500}>Contract Quick Information</Title>
                <form onSubmit={form.onSubmit((_values) => handleUpdate())}>
                    <Stack gap={6}>
                        <Group w={'100%'} align='end'>
                            <TextInput radius={'md'} label="Contarct Address" disabled value={contract_address ?? ''} flex={1} />
                            <CustomCopyBtn color={color} copy_value={contract_address} />
                        </Group>
                        <TextInput radius={'md'} label="Contract Name" {...form.getInputProps('name')} />
                        <Group mt={'sm'}>
                            <Button type="submit" radius={'md'} color={color} leftSection={<IconWriting />} rightSection={loading ? <Loader color="white" size={'sm'} /> : null}>
                                Update
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Stack>
        </WrapperBox>
    )
}

export default AboutContract