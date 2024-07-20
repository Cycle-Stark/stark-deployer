import { ActionIcon, CopyButton, em, Tooltip } from "@mantine/core"
import { IconCheck, IconCopy } from "@tabler/icons-react"



interface ICustomCopyBtn {
    color: string
    copy_value: string
}

const CustomCopyBtn = (props: ICustomCopyBtn) => {
    const { color, copy_value } = props
    return (
        <CopyButton value={copy_value}>
            {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} >
                    <ActionIcon variant="transparent" size={'sm'} radius={'md'} color={copied ? `${color}.9` : color} onClick={copy}>
                        {copied ? <IconCheck stroke={em(1.5)} size="18px" /> : <IconCopy stroke={em(1.5)} size="18px" />}
                    </ActionIcon>
                </Tooltip>
            )}
        </CopyButton>
    )
}

export default CustomCopyBtn