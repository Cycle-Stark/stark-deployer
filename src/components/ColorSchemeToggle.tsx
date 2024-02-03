import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'
import { isDarkMode } from '../configs/utils'

interface IColorSchemeToggle {
    size?: string | number
}
const ColorSchemeToggle = (props: IColorSchemeToggle) => {
    const { size } = props
    
    const { colorScheme, setColorScheme } = useMantineColorScheme()
    return (
        <div>
            <ActionIcon size={size} variant='subtle' radius={'md'} onClick={() => setColorScheme(isDarkMode(colorScheme) ? 'light' : 'dark')}>
                {isDarkMode(colorScheme) ? <IconSun /> : <IconMoon />}
            </ActionIcon>
        </div>
    )
}

export default ColorSchemeToggle