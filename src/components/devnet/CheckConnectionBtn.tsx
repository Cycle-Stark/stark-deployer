import { Button, Indicator } from "@mantine/core"
import { useEffect, useState } from "react"
import { useDevnetContext } from "../../providers/DevnetProvider"

const CheckConnectionBtn = () => {
    const [serverStatus, setServerStatus] = useState(false)
    const {devnetServerStatus} = useDevnetContext()

    useEffect(() => {
        if(devnetServerStatus){
            setServerStatus(devnetServerStatus)
        }
    }, [devnetServerStatus])
    return (
        <div>
            <Button leftSection={<Indicator color={serverStatus ? 'green' : 'red'} />} variant="outline" radius={'md'} color={serverStatus ? 'green' : 'red'}>
                {serverStatus ? 'Connected' : 'Disconnected'}
            </Button>
        </div>
    )
}

export default CheckConnectionBtn