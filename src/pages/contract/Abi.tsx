import { useContractContext } from '../../providers/ContractProvider'
import { CodeHighlightTabs } from '@mantine/code-highlight'
import RoundedBox from '../../components/common/RoundedBox'

const Abi = () => {
    const { deployment } = useContractContext()
    return (
        <div>
            <RoundedBox>
                <CodeHighlightTabs
                    withExpandButton
                    defaultExpanded={false}
                    expandCodeLabel="Show full ABI"
                    collapseCodeLabel="Show less"
                    maxCollapsedHeight={600}
                    code={[
                        { fileName: 'abi.json', code: JSON.stringify(deployment?.abi?.abi ?? { loading: true }, null, 4), language: 'json' },
                    ]}
                />
            </RoundedBox>
        </div>
    )
}

export default Abi