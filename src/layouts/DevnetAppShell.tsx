import { ActionIcon, AppShell, Box, Container, Group, Image, ScrollArea, Stack, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { ReactNode } from 'react'
import { isDarkMode } from '../configs/utils'
import { Link } from 'react-router-dom'
import ColorSchemeToggle from '../components/ColorSchemeToggle'
import { IconAdjustmentsHorizontal, IconCodeAsterix, IconDashboard, IconHome2, IconSettings, IconUpload, IconUsersGroup } from '@tabler/icons-react'
import { CustomSidebarIconLink } from '../components/navigation/CustomSidebarNavLink'
import CheckConnectionBtn from '../components/devnet/CheckConnectionBtn'
import CustomAccordion, { AccordionItem } from '../components/common/CustomAccordion'
import AboutContract from '../components/handy_tools/AboutContract'
import ApproveTool from '../components/handy_tools/ApproveTool'
import ConvertToLargeNumber from '../components/handy_tools/ConvertToLargeNumber'
import { useDisclosure } from '@mantine/hooks'
import { SwitchAccountBtn } from '../components/devnet/SwitchAccountBtn'
interface IDevnetAppShell {
    children: ReactNode
}

const DevnetAppShell = (props: IDevnetAppShell) => {
    const { children } = props

    const aside = useDisclosure(true);

    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    const itemList: AccordionItem[] = [
        {
            id: 'about',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'About Contract',
            description: 'A quick information about the current contract',
            content: <AboutContract color='orange' />,
        },
        {
            id: 'approver',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'Token Approver Tool',
            description: 'A tool to help you approve token usage for your contract(s) in a quick and easy way',
            content: <ApproveTool color='violet' />
        },
        {
            id: 'convert',
            image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
            label: 'Large Number Creator Tool',
            description: 'A tool to help you create Large Numbers for use in your contract ie tokens',
            content: <ConvertToLargeNumber color="indigo" />
        },
    ]

    const Tools = () => {

        return (
            <Stack p="xs">
                <CustomAccordion itemList={itemList} activeItemsIds={['convert']} />
            </Stack>
        )
    }


    return (
        <Box style={{
            backgroundImage: isDarkMode(colorScheme) ? 'url(/images/bg/bg-dark.png)' : 'linear-gradient(to right, rgb(218, 238, 241), rgb(218, 238, 241)), url(/images/bg/bg-light.png)',
            backgroundSize: "cover",
            backgroundRepeat: 'no-repeat',
            backgroundBlendMode: 'multiply',
            backgroundAttachment: 'fixed',
            position: "relative"
        }}>
            <AppShell
                navbar={{ breakpoint: 'xs', width: { base: 80, xs: 80, sm: 60, xl: 80, lg: 80 } }}
                header={{ height: { base: 70 } }}
                aside={{ width: { base: 300, lg: 450 }, breakpoint: "sm", collapsed: { desktop: aside[0], mobile: aside[0] } }}
                layout='alt'
            >
                <AppShell.Header withBorder={false} zIndex={999}>
                    <Container size={'xxl'} className='h-100'>
                        <Group className='h-100' align='center' justify='space-between'>
                            <Title>Devnet</Title>
                            <Group className='h-100' align='center'>
                                <CheckConnectionBtn />
                                <SwitchAccountBtn />
                                <ActionIcon onClick={aside[1].toggle} variant='light' radius='md'>
                                    <IconAdjustmentsHorizontal />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Container>
                </AppShell.Header>
                <AppShell.Navbar bg={isDarkMode(colorScheme) ? theme.colors.dark[8] : theme.colors.gray[2]} withBorder={false}>
                    <AppShell.Section h={70} py="sm" bg={isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.white}>
                        <Group justify='center'>
                            <Link to={'/'}>
                                <Image src={'/images/icons/ico.png'} w={'50px'} />
                            </Link>
                        </Group>
                    </AppShell.Section>
                    <AppShell.Section grow component={ScrollArea} scrollbarSize={10}>
                        <Box p={'md'}>
                            <Stack align='center' gap={10}>
                                {/* <CustomSidebarIconLink to={'/'} title={'Home'} icon={<IconHome2 />} color={'red'} /> */}
                                <CustomSidebarIconLink to={'/devnet'} title={'Dashboard'} icon={<IconDashboard />} color={'indigo'} />
                                <CustomSidebarIconLink to={'/devnet/contracts'} title={'Contracts'} icon={<IconCodeAsterix />} color={'indigo'} />
                                <CustomSidebarIconLink to={'/devnet/deploy'} title={'Deploy Contract'} icon={<IconUpload />} color={'indigo'} />
                                <CustomSidebarIconLink to={'/devnet/accounts'} title={'Accounts'} icon={<IconUsersGroup />} color={'indigo'} />
                                <CustomSidebarIconLink to={'/devnet/settings'} title={'Settings'} icon={<IconSettings />} color={'indigo'} />
                            </Stack>
                        </Box>
                    </AppShell.Section>
                    <AppShell.Section bg={isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors.gray[3]}>
                        <Stack align='center' gap={10} py="lg">
                            <CustomSidebarIconLink to={'/'} title={'Home'} icon={<IconHome2 />} color={'indigo'} />
                            <ColorSchemeToggle size={42} />
                        </Stack>
                    </AppShell.Section>
                </AppShell.Navbar>
                <AppShell.Main>
                    <Box style={{
                        transition: "all 0.5s ease-in-out"
                    }}>
                        {children}
                    </Box>
                </AppShell.Main>
                <AppShell.Aside withBorder={false} p={0} pt={70}>
                    <AppShell.Section grow component={ScrollArea} scrollbarSize={10}>
                        <Tools />
                    </AppShell.Section>
                </AppShell.Aside>
            </AppShell>
        </Box>
    )
}

export default DevnetAppShell