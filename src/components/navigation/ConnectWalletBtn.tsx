import { ActionIcon, Button } from "@mantine/core"
import { IconWallet } from "@tabler/icons-react"
import { limitChars } from "../../configs/utils"
import { useAppContext } from "../../providers/AppProvider"

const ConnectWalletBtn = () => {
    const { handleConnetWalletBtnClick, address } = useAppContext()
    const { isSmallScreen } = useAppContext()

    return (
        <>
            {
                isSmallScreen ? (
                    <ActionIcon variant="light" onClick={handleConnetWalletBtnClick}>
                        <IconWallet stroke={1.5} />
                    </ActionIcon>
                ) : (
                    <Button variant='outline' radius={'xl'} size="sm" leftSection={<IconWallet stroke={1.5} />} onClick={handleConnetWalletBtnClick}>
                        {
                            address ? limitChars(address, 10, true) : 'Connect'
                        }
                    </Button >
                )
            }
        </>

    )
}

export default ConnectWalletBtn