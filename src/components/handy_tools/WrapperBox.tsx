import { Box, useMantineColorScheme } from "@mantine/core"
import { ReactNode } from "react"
import { isDarkMode } from "../../configs/utils"

interface IWrapperBox {
    color: string
    children: ReactNode
}

const WrapperBox = (props: IWrapperBox) => {
    const { color, children } = props
    const { colorScheme } = useMantineColorScheme()
    return (
        <Box p={'md'} style={theme => ({
            background: isDarkMode(colorScheme) ? theme.colors.dark[7] : theme.colors[color][2],
            borderRadius: theme.radius.md
        })}>
            {children}
        </Box>
    )
}

export default WrapperBox