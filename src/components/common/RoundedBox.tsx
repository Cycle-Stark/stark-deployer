import { Box } from '@mantine/core'

const RoundedBox = (props: any) => {
    return (
        <Box style={theme => ({
            borderRadius: theme.radius.md,
            overflow: 'hidden'
        })}>
            {props.children}
        </Box>
    )
}

export default RoundedBox