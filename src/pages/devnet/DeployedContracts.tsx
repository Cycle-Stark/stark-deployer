import { Box, Stack, Title, Grid, Text, Avatar, Button, Group, useMantineColorScheme, Container, Divider, ActionIcon, em, Tooltip } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";
import { IconArrowRight, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { isDarkMode, limitChars } from "../../configs/utils";
import { InfoRow } from "../../components/app/Deployments";
import { useEffect, useState } from "react";
import { useDevnetContext } from "../../providers/DevnetProvider";
import { showNotification } from "@mantine/notifications";
import { modals } from "@mantine/modals";


interface IDevnetDeploymentCard {
  info: any
}

const DevnetDeploymentCard = (props: IDevnetDeploymentCard) => {
  const { info } = props
  const [isFound, setIsFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const { colorScheme } = useMantineColorScheme()
  const { account } = useDevnetContext()

  const checkIfContractExists = async () => {
    account?.getClassAt(info?.contract_address).then((_res: any) => {
      setIsFound(true)
    }).catch((_err: any) => {
      setIsFound(false)
    })
  }

  const deleteContract = () => {
    setLoading(true)
    db.devnet_function_calls.where('contract_address').equalsIgnoreCase(info?.contract_address).delete()
    db.devnet_contracts.delete(info?.id).then(() => {
      showNotification({
        title: "Contract deletion",
        message: "Contract deleted successfully",
        icon: <IconInfoCircle />
      })
      window.location.reload()
    }).catch(() => { }).finally(() => {
      setLoading(false)
    })
  }

  const showDeletionModal = () => modals.openConfirmModal({
    children: (
      <Text>Are you sure you want to delete {`'${info?.name}' Contract?`}</Text>
    ),
    onConfirm: deleteContract,
    confirmProps: {
      color: 'red',
      radius: 'md'
    },
    cancelProps: {
      radius: 'md'
    },
    labels: {
      confirm: 'Delete',
      cancel: 'Cancel'
    }
  })

  useEffect(() => {
    checkIfContractExists()
  }, [])

  return (
    <Box p="lg" style={theme => ({
      background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
      borderRadius: theme.radius.lg,
      border: `2px solid ${isFound ? theme.colors.green[6] : theme.colors.red[6]}`,
      position: "relative"
    })} >

      <Stack gap={6}>
        <Avatar tt={'lowercase'} size={'82px'} mx={'auto'}>
          {limitChars(info?.contract_address, 3, false)}
        </Avatar>
        <InfoRow title='Status' value={isFound ? 'Found' : 'Not Found'} hideCopyButton charLimit={15} />
        <Divider />
        <InfoRow title='Contract Name' value={info?.name} charLimit={15} />
        <InfoRow title='Deployment ID' value={info?.id} charLimit={15} hideCopyButton />
        <InfoRow hideLink={true} title='Contract Address' value={info?.contract_address} chainId={info?.chainId ?? ''} key_='contract' />
        <InfoRow hideLink={true} title='Transaction Hash' value={info?.tx_info?.transaction_hash} chainId={info?.chainId ?? ''} key_='tx' />
        <InfoRow hideLink={true} title='Class Hash' value={info?.tx_info?.class_hash} chainId={info?.chainId ?? ''} key_='class' />
        <InfoRow title='Date' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
        <Group justify='end' mt={'md'} gap={'sm'}>
          <Button size='xs' component={Link} color={isFound ? 'green' : 'red'} to={`/devnet/contracts/interact/${info?.id}/dashboard`} radius={'xl'} rightSection={<IconArrowRight size={'18px'} />}>
            Interact
          </Button>
          <Tooltip label="Delete" color='red' fs={'14px'}>
            <ActionIcon radius={'sm'} size={'sm'} variant='light' color='red' onClick={showDeletionModal} loading={loading}>
              <IconTrash stroke={em(1.5)} size={'18px'} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Box>
  )
}

const DeployedContracts = () => {
  const contracts = useLiveQuery(() => db.devnet_contracts.reverse().toArray());

  return (
    <Container size={"xxl"} py="xl">
      <Box>
        <Stack>
          <Title order={2}>Deployments ({contracts?.length ?? '0'})</Title>
          {
            contracts?.length === 0 || !contracts ? <Text size='sm' fw={500}>No deployments done</Text> : null
          }
          <Grid>
            {
              contracts?.map((deployment: any, i: any) => (
                <Grid.Col key={`deployment_${i}`} span={{ md: 4, lg: 3, xl: 2 }}>
                  <DevnetDeploymentCard info={deployment} />
                </Grid.Col>
              ))
            }
          </Grid>
        </Stack>
      </Box>
    </Container>
  )
}

export default DeployedContracts 