import { ReactNode } from "react";
import DevnetAppShell from "./DevnetAppShell";
import DevnetProvider from "../providers/DevnetProvider";

interface IDevnetLayout {
    children: ReactNode
}

const DevnetLayout = (props: IDevnetLayout) => {
    const { children } = props
    return (
            <DevnetProvider>
                <DevnetAppShell>
                    {children}
                </DevnetAppShell>
            </DevnetProvider>
    )
}

export default DevnetLayout