import { ActionIcon, Alert, Anchor, Box, Button, Group, Highlight, Stack, Text, Title } from "@mantine/core";
import { useAppContext } from "../providers/AppProvider"
import { IconBrandGithub, IconBrandTelegram, IconBrandTwitter, IconCodePlus, IconDownload, IconInfoCircle, IconUpload } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";



const Home = () => {
  const { isSmallScreen, account } = useAppContext()

  const deployAccount = () => {
    if (account) {
      try {
        account?.deploySelf({ classHash: "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b" })
      } catch (ex) {
        console.log(ex)
      }
    }
  }

  useEffect(() => {
    deployAccount()
  }, [])

  return (
    <div>
      <Box py={100}>
        <Stack>
          <Title order={1} fw={700} ta={"center"} size={isSmallScreen ? '42px' : '72px'}>Deploy with Ease_ <br />
            {' '}<Highlight highlight={['Revolutionizing']} size="72px" color="darkBlue.9" style={{ borderRadius: '10px' }}>Revolutionizing</Highlight> {' '}
            Starknet Development</Title>
          <Text c="dimmed" ta={'center'} maw={isSmallScreen ? '100%' : '70%'} mx={'auto'}>
            Revolutionize your Starknet development experience with our deployment platform.
          </Text>
          <Text c={'dimmed'} ta={'center'} maw={isSmallScreen ? '100%' : '70%'} mx={'auto'}>
            Say goodbye to deployment errors and hello to effortless contract deployment. Seamlessly deploy to both mainnet and testnet at the click of a button. Elevate your projects with simplicity and speed.
          </Text>
          <Alert title="Take Note" icon={<IconInfoCircle />} color="yellow" radius={'md'}>
            <Text>Use APIs from <Anchor href="https://blastapi.io/public-api/starknet" target="_blank">Blast API</Anchor> and Braavos wallet to declare and deploy your contracts.</Text>
          </Alert>
          <Group align="center" justify="center">
            <Button radius={'xl'} size="lg" px={'50px'} component={Link} to={'/deploy'} rightSection={<IconUpload />}>Deploy</Button>
            <Button radius={'xl'} size="lg" px={'50px'} color="cyan" component={Link} to={'/import'} rightSection={<IconDownload />}>Import</Button>
            <Button radius={'xl'} size="lg" px={'50px'} color="indigo" component={Link} to={'/devnet'} rightSection={<IconCodePlus />}>Devnet</Button>
          </Group>
          <Group justify="center" my="xl">
            <Anchor href="https://x.com/dalmasonto" target="_blank">
              <ActionIcon variant="transparent" size={'42px'} color="blue" >
                <IconBrandTwitter size={'42px'} stroke={1.5} />
              </ActionIcon>
            </Anchor>
            <Anchor href="https://github.com/Cycle-Stark/stark-deployer" target="_blank">
              <ActionIcon variant="transparent" size={'42px'} color="green">
                <IconBrandGithub size={'42px'} stroke={1.5} />
              </ActionIcon>
            </Anchor>
            <Anchor href="https://t.me/dalmasonto" target="_blank">
              <ActionIcon variant="transparent" size={'42px'} color="indigo">
                <IconBrandTelegram size={'42px'} stroke={1.5} />
              </ActionIcon>
            </Anchor>
          </Group>
        </Stack>
      </Box >
    </div >
  )
}

export default Home


