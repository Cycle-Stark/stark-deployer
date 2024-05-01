import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { theme } from '../theme'

interface ICustomMantineProvider {
    children: React.ReactNode
}

const CustomMantineProvider = (props: ICustomMantineProvider) => {
    const { children } = props
    return (
        <MantineProvider theme={theme} >
            <ModalsProvider >
                <Notifications autoClose={10000} />
                {children}
            </ModalsProvider>
        </MantineProvider>
    )
}

export default CustomMantineProvider