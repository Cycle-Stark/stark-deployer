import { Text, useMantineColorScheme } from '@mantine/core';
import { NavLink, useMatch, useResolvedPath } from 'react-router-dom';
import { isDarkMode } from '../../configs/utils';
import { IconHomeEco } from '@tabler/icons-react';

export interface ICustomNavLinkProps {
    to: string
    title: string
    icon: any
}

export const navlinks: ICustomNavLinkProps[] = [
    {
        to: '/',
        title: 'Home',
        icon: <IconHomeEco stroke={1.5} />
    },
    {
        to: '/production-testnet',
        title: 'Prod & Testnet',
        icon: <IconHomeEco stroke={1.5} />
    },
    {
        to: '/devnet',
        title: 'Devnet',
        icon: <IconHomeEco stroke={1.5} />
    },
]

const CustomNavLink = ({ to, title }: ICustomNavLinkProps) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });
    const { colorScheme } = useMantineColorScheme()

    return (
        <Text component={NavLink} to={to} variant={match ? 'filled' : 'outline'} fw={500} fs={"16px"} style={theme => ({
            color: match ? theme.colors.blue[6] : isDarkMode(colorScheme) ? theme.colors.gray[1] : theme.colors.dark[6]
        })}>
            {title}
        </Text>
    )
}

export default CustomNavLink