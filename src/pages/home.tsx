import { ActionIcon, Anchor, Box, Button, Group, Highlight, Stack, Text, Title } from "@mantine/core";
import { useAppContext } from "../providers/AppProvider"
import { IconBrandGithub, IconBrandTelegram, IconBrandTwitter, IconCodePlus, IconUpload } from "@tabler/icons-react";
import { Link } from "react-router-dom";



const Home = () => {
  const { isSmallScreen } = useAppContext()

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
          <Group align="center" justify="center">
            <Button radius={'xl'} size="lg" px={'50px'} component={Link} to={'/production-testnet'} rightSection={<IconUpload />}>Deploy</Button>
            <Button radius={'xl'} size="lg" px={'50px'} color="indigo" component={Link} to={'/devnet'} rightSection={<IconCodePlus />}>Devnet</Button>
          </Group>
          <Group justify="center" my="xl">
            <Anchor href="https://x.com/dalmasonto" target="_blank">
              <ActionIcon variant="transparent" size={'42px'} color="blue" >
                <IconBrandTwitter size={'42px'} stroke={1.5} />
              </ActionIcon>
            </Anchor>
            <Anchor href="https://github.com/dalmasonto" target="_blank">
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