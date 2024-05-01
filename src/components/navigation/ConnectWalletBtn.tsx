import { ActionIcon, Button } from "@mantine/core"
import { IconWallet } from "@tabler/icons-react"
import { limitChars } from "../../configs/utils"
import { useAppContext } from "../../providers/AppProvider"
import { useEffect, useState } from "react"

const ConnectWalletBtn = () => {
    const [connectedAddress, setConnectedAddress] = useState(null)
    const { handleConnetWalletBtnClick, address } = useAppContext()
    const { isSmallScreen } = useAppContext()

    useEffect(() => {
        setConnectedAddress(address)
    }, [address])

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
                            connectedAddress ? limitChars(connectedAddress, 10, true) : 'Connect'
                        }
                    </Button >
                )
            }
        </>

    )
}

export default ConnectWalletBtn