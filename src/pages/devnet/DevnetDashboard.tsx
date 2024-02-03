import { Container, Stack, Text, Title } from "@mantine/core"
import { useEffect } from "react"
import { useDevnetContext } from "../../providers/DevnetProvider"
import { limitChars } from "../../configs/utils"
import DevnetInstructions from "../../components/handy_tools/DevnetInstructions"


const DevnetDashboard = () => {
    // const [events, setEvents] = useState([])
    const { provider, address } = useDevnetContext()

    const loadEvents = async () => {
        if (provider) {
            try {

                // const block = await provider.getBlock('latest');
                // const from_block = block.block_number - 10
                // const eventsList = await provider.getEvents({
                //     // address: myContractAddress,
                //     from_block: { block_number: from_block < 0 ? 0 : from_block },
                //     to_block: { block_number: block.block_number },
                //     keys: [],
                //     chunk_size: 10
                // });

                // let event = eventsList?.events[0]
            }
            catch (error) {

            }
        }
    }

    useEffect(() => {
        loadEvents()
    }, [])
    return (
        <Container size={"xxl"} py={'lg'}>
            <Stack>
                <Title>Dashboard</Title>
                {
                    address ? (
                        <Text>Welcome Back {limitChars(address ?? '', 20, true)}</Text>
                    ) : null
                }
                <DevnetInstructions />
            </Stack>
        </Container>
    )
}

export default DevnetDashboard