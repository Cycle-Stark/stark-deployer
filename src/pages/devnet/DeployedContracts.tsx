import { Box, Stack, Title, Grid, Text, Avatar, Button, Group, useMantineColorScheme, Container, Indicator } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { isDarkMode, limitChars } from "../../configs/utils";
import { InfoRow } from "../../components/app/Deployments";
import { useEffect, useState } from "react";
import { useDevnetContext } from "../../providers/DevnetProvider";


interface IDevnetDeploymentCard {
  info: any
}

const DevnetDeploymentCard = (props: IDevnetDeploymentCard) => {
  const { info } = props
  const [isFound, setIsFound] = useState(false)
  const { colorScheme } = useMantineColorScheme()
  const { account } = useDevnetContext()

  const checkIfContractExists = async () => {
    account?.getClassAt(info?.contract_address).then((_res: any) => {
      setIsFound(true)
    }).catch((_err: any) => {
      setIsFound(false)
    })
  }

  useEffect(() => {
    checkIfContractExists()
  }, [])

  return (
    <Box p="lg" style={theme => ({
      background: isDarkMode(colorScheme) ? theme.colors.dark[5] : theme.colors.gray[0],
      borderRadius: theme.radius.lg,
      position: "relative"
    })} >

      <Stack gap={4}>
        <Indicator inline label={isFound ? 'Found' : 'Not Found'} color={isFound ? 'green' : 'yellow'}  position="bottom-center" size={'lg'} radius={'sm'}>
          <Avatar tt={'lowercase'} size={'82px'} mx={'auto'}>
            {limitChars(info?.contract_address, 3, false)}
          </Avatar>
        </Indicator>
        <InfoRow title='Contract Name' value={info?.name} charLimit={20} />
        <InfoRow hideLink={true} title='Contract Address' value={info?.contract_address} chainId={info?.chainId ?? ''} key_='contract' />
        <InfoRow hideLink={true} title='Transaction Hash' value={info?.tx_info?.transaction_hash} chainId={info?.chainId ?? ''} key_='tx' />
        <InfoRow hideLink={true} title='Class Hash' value={info?.tx_info?.class_hash} chainId={info?.chainId ?? ''} key_='class' />
        <InfoRow title='Date' value={info?.date ?? '-'} hideLink={true} charLimit={30} hideCopyButton={true} />
        <Group justify='space-between'>
          <Button size='xs' component={Link} color='indigo' to={`/devnet/contracts/interact/${info?.id}/dashboard`} radius={'md'} rightSection={<IconArrowRight size={'18px'} />}>
            Interact
          </Button>
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
                <Grid.Col key={`deployment_${i}`} span={{ md: 4, lg: 3 }}>
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