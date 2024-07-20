import { ActionIcon, AppShell, Box, Container, Group, Image, ScrollArea, Stack, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { ReactNode } from 'react'
import { isDarkMode } from '../configs/utils'
import { Link, useParams } from 'react-router-dom'
import ColorSchemeToggle from '../components/ColorSchemeToggle'
import { IconAdjustmentsHorizontal } from '@tabler/icons-react'
import CheckConnectionBtn from '../components/devnet/CheckConnectionBtn'
import CustomAccordion, { AccordionItem } from '../components/common/CustomAccordion'
import AboutContract from '../components/handy_tools/AboutContract'
import ApproveTool from '../components/handy_tools/ApproveTool'
import ConvertToLargeNumber from '../components/handy_tools/ConvertToLargeNumber'
import { useDisclosure } from '@mantine/hooks'
import { SwitchAccountBtn } from '../components/devnet/SwitchAccountBtn'
import CustomNavLink, { ICustomNavLinkProps, devnetNavlinks } from '../components/navigation/CustomNavLink'
import { useDevnetContractContext } from '../providers/DevnetContractProvider'
import { SideBarContents } from './contracts/DevnetContractLayout'
interface IDevnetAppShell {
    children: ReactNode
}

const DevnetAppShell = (props: IDevnetAppShell) => {
    const { children } = props

    const aside = useDisclosure(true);

    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()
    const { contract_id } = useParams()
    const { interfaces, deployment, functions, extra_functions } = useDevnetContractContext()

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
                navbar={{ breakpoint: 'xs', width: { base: 300 }, collapsed: { desktop: !contract_id ? true : false, mobile: true } }}
                header={{ height: { base: 70 } }}
                aside={{ width: { base: 350, lg: 350 }, breakpoint: "sm", collapsed: { desktop: aside[0], mobile: aside[0] } }}
                layout='default'
            >
                <AppShell.Header withBorder={false}>
                    <Container size={'xxl'} className='h-100'>
                        <Group className='h-100' align='center' justify='space-between'>
                            <Group justify='center'>
                                <Link to={'/devnet'}>
                                    <Image src={'/images/icons/ico.png'} w={'50px'} />
                                </Link>
                                <Title>Devnet</Title>
                            </Group>
                            <Group>
                                {
                                    devnetNavlinks?.map((link: ICustomNavLinkProps, i: number) => (
                                        <CustomNavLink key={`navlink_${i}`} {...link} />
                                    ))
                                }
                            </Group>
                            <Group className='h-100' align='center' justify='center'>
                                <CheckConnectionBtn />
                                <SwitchAccountBtn />
                                <ActionIcon onClick={aside[1].toggle} variant='light' radius='md'>
                                    <IconAdjustmentsHorizontal />
                                </ActionIcon>
                                <ColorSchemeToggle />
                            </Group>
                        </Group>
                    </Container>
                </AppShell.Header>
                <AppShell.Navbar bg={isDarkMode(colorScheme) ? theme.colors.dark[8] : theme.colors.gray[0]} withBorder={false} py={'xs'}>
                    <SideBarContents deployment={deployment} interfaces={interfaces} functions={functions} extra_functions={extra_functions} />
                </AppShell.Navbar>
                <AppShell.Main>
                    <Box p="md">
                        <Box p={'xs'} style={theme => ({
                            background: isDarkMode(colorScheme) ? theme.colors.dark[6] : theme.colors.gray[2],
                            borderRadius: theme.radius.md
                        })}>
                            {children}
                        </Box>
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
