import { Stack, Text, Title } from "@mantine/core"
import WrapperBox from "./WrapperBox"
import { CodeHighlight } from "@mantine/code-highlight"

const instructions = [
    {
        title: 'Cargo Install',
        code: "cargo install starknet-devnet --version 0.0.7",
        language: "shell"
    },
    {
        title: 'Run Devnet',
        code: `starknet-devnet`,
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
                    <CodeHighlight code="Starknet Devnet RS - v0.0,0.7" language="js" style={{ borderRadius: '10px' }} />
                    <Title order={3}>How to install & run the required Devnet </Title>
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

// braavos://invoke/
// 0x05411c4fa52c0ca5de38b1af0329fcb71c38761af7c828da83dc5bd495e4571e
// @SN_MAIN?
// source=wallet&
// calls=
// NobwRAxg9gdgLgJwIYTgQQCYYQUwM55gBcYADAB4CsAzBAJwCMATDQEb0BsAHExKQCx0mdCElJMcGUqVbUc-JtQBmHAOwNSGCTlU5NlHK1akOSuRDPckXMABowOeAgCeABygBLeMTCIkMPCUcBDtIJAAbcIwkOCRiYDJyUlVNJBwufhxKJTosyly01komJS4GJSUIJlUuSlVWfgYcRlVuHCR+flUlVjoMjn4kBn4MHD1WDgZQjWlZ2dDSMABdAF8loA
// &rid=1707325692822-5077035917689&ttl=1707325882871;