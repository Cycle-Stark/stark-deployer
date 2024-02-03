import { CodeHighlightTabs } from "@mantine/code-highlight"
import RoundedBox from "../../../components/common/RoundedBox"
import { useDevnetContractContext } from "../../../providers/DevnetContractProvider"
import { Stack, Title } from "@mantine/core"


const DevnetContractAbi = () => {
    const { deployment } = useDevnetContractContext()
    return (
        <Stack>
            <Title>Contract ABI</Title>
            <RoundedBox>
                <CodeHighlightTabs
                    withExpandButton
                    defaultExpanded={false}
                    expandCodeLabel="Show full ABI"
                    collapseCodeLabel="Show less"
                    maxCollapsedHeight={600}
                    maw={'100%'}
                    code={[
                        { fileName: 'abi.json', code: JSON.stringify(deployment?.abi?.abi ?? { loading: true }, null, 4), language: 'json' },
                    ]}
                />
            </RoundedBox>
        </Stack>
    )
}

export default DevnetContractAbi