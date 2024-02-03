import { Stack, Text, Title } from "@mantine/core"
import WrapperBox from "./WrapperBox"
import { CodeHighlight } from "@mantine/code-highlight"

const instructions = [
    {
        title: 'Clone the Repo',
        code: "git clone -b rpc-0.5.0 git@github.com:0xSpaceShard/starknet-devnet-rs.git",
        language: "shell"
    },
    {
        title: 'Navigate to the new folder',
        code: "cd starknet-devnet-rs",
        language: "shell"
    },
    {
        title: 'Export required ENV variables',
        code: `export RPC_SPEC_VERSION="0.5.0"\nexport STARKNET_VERSION="2.4.3"`,
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