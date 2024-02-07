import { Stack, Text, Title } from "@mantine/core"
import WrapperBox from "./WrapperBox"
import { CodeHighlight } from "@mantine/code-highlight"

const instructions = [
    {
        title: 'Clone the Repo',
        code: "git clone https://github.com/dalmasonto/devnet-rs-for-stark-deployer",
        language: "shell"
    },
    {
        title: 'Navigate to the new folder',
        code: "cd devnet-rs-for-stark-deployer",
        language: "shell"
    },
    {
        title: 'Export required ENV variables',
        code: `export RPC_SPEC_VERSION="0.5.1"\nexport STARKNET_VERSION="0.13.0"`,
        language: "ts"
    },
    {
        title: 'Run Devnet',
        code: `cargo run`,
        language: "ts"
    }
]


const Instruction = (props: any) => {
    const { index, title, code, language } = props
    return (
        <Stack gap={10}>
            <Text fw={500}>{index}. {title}</Text>
            <CodeHighlight code={code} language={language} style={{ borderRadius: '10px' }} />
        </Stack>
    )
}

const DevnetInstructions = () => {
    return (
        <div>
            <WrapperBox color="indigo">
                <Stack>
                    <Title order={2}>How to Get Started</Title>
                    <Title order={3}>Requirements</Title>
                    <CodeHighlight code="Starknet Devnet RS - [rpc-0.5.0] branch" language="js" style={{ borderRadius: '10px' }} />
                    <Title order={3}>How to install & run the required devnet branch </Title>
                    {
                        instructions?.map((item: any, i: number) => (
                            <Instruction key={`instruction_${i}`} index={i + 1} {...item} />
                        ))
                    }
                </Stack>
            </WrapperBox>
        </div>
    )
}

export default DevnetInstructions