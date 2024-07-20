import { ReactNode } from "react";
import DevnetAppShell from "./DevnetAppShell";
import DevnetProvider from "../providers/DevnetProvider";
import DevnetContractProvider from "../providers/DevnetContractProvider";

interface IDevnetLayout {
    children: ReactNode
}

const DevnetLayout = (props: IDevnetLayout) => {
    const { children } = props
    return (
        <DevnetProvider>
            <DevnetContractProvider>
                <DevnetAppShell>
                    {children}
                </DevnetAppShell>
            </DevnetContractProvider>
        </DevnetProvider>
    )
}

export default DevnetLayout