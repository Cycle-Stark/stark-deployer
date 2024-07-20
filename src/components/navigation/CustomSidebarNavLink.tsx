import { ActionIcon, NavLink as MantineNavLink, Tooltip, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { isDarkMode } from '../../configs/utils';

export interface ICustomTabLinkProps {
    to: string
    title: string
    icon: any
    color: string
}

const CustomSidebarNavLink = ({ to, title, icon, color }: ICustomTabLinkProps) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });

    return (
        <MantineNavLink leftSection={icon} 
        component={Link} label={title} color={color} to={to} active={true} variant={match ? 'light' : 'default'} style={theme => ({
            // outline: `2px solid ${true ? color: 'transparent'}`,
            outlineOffset: "2px",
            border: "none",
            fontWeight: "400",
            borderRadius: theme.radius.md
        })} />
    )
}

const CustomSidebarIconLink = ({ to, title, icon, color }: ICustomTabLinkProps) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    return (
        <Tooltip label={title} withArrow position='right' arrowSize={10}>
            <ActionIcon size={42} radius={'md'} variant={match ? 'filled' : 'default'} component={Link} to={to} color={match ? color : isDarkMode(colorScheme) ? theme.colors.dark[6] : theme.colors.gray[2]}>
                {icon}
            </ActionIcon>
        </Tooltip>
    )
}

export { CustomSidebarIconLink }
export default CustomSidebarNavLink