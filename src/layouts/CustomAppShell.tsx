import { AppShell, Box, Container, Group, Image, useMantineColorScheme } from '@mantine/core'
import { ReactNode } from 'react'
import ConnectWalletBtn from '../components/navigation/ConnectWalletBtn'
import CustomNavLink, { ICustomNavLinkProps, navlinks } from '../components/navigation/CustomNavLink'
import { isDarkMode } from '../configs/utils'
import { Link } from 'react-router-dom'
import SmallScreenMenu from '../components/navigation/SmallScreenMenu'
import { useMediaQuery } from '@mantine/hooks'
import SwitchNetwork from '../components/navigation/SwitchNetwork'
import ColorSchemeToggle from '../components/ColorSchemeToggle'

interface ICustomAppShell {
    children: ReactNode
}

const CustomAppShell = (props: ICustomAppShell) => {
    const { children } = props

    const { colorScheme } = useMantineColorScheme()
    const matches = useMediaQuery('(max-width: 768px)');

    return (
        <Box style={{
            backgroundImage: isDarkMode(colorScheme) ? 'url(/images/bg/bg-dark.png)' : 'linear-gradient(to right, rgb(218, 238, 241), rgb(218, 238, 241)), url(/images/bg/bg-light.png)',
            backgroundSize: "cover",
            backgroundRepeat: 'no-repeat',
            backgroundBlendMode: 'multiply',
            backgroundAttachment: 'fixed',
        }}>
            <AppShell header={{ height: { base: 70, md: 70 } }}>
                <AppShell.Header className='header' withBorder={false} style={{
                    background: isDarkMode(colorScheme) ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                }}>
                    <Container size={'xl'} className='h-100'>
                        <Group align='center' className='h-100' justify='space-between'>
                            <Link to={'/'}>
                                <Image src={'/images/icons/logo.png'} h={'60px'} w={"160px"} />
                            </Link>
                            {
                                !matches ? (
                                    <Group>
                                        {
                                            navlinks?.map((link: ICustomNavLinkProps, i: number) => (
                                                <CustomNavLink key={`navlink_${i}`} {...link} />
                                            ))
                                        }
                                    </Group>
                                ) : null
                            }
                            <Group gap={6}>
                                <ConnectWalletBtn />
                                <SwitchNetwork />
                                <ColorSchemeToggle />
                                {
                                    matches ? <SmallScreenMenu /> : null
                                }
                            </Group>
                        </Group>
                    </Container>
                </AppShell.Header>
                <AppShell.Main>
                    <Container size={'xl'} py={40} style={{paddingBlock: "40px"}}>
                        {children}
                    </Container>
                </AppShell.Main>
            </AppShell>
        </Box>
    )
}

export default CustomAppShell