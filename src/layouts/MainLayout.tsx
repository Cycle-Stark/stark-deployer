import { ReactNode } from "react";
import CustomAppShell from "./CustomAppShell";
import AppProvider from "../providers/AppProvider";

interface IMainLayout {
    children: ReactNode
}

const MainLayout = (props: IMainLayout) => {
    const { children } = props
    return (
        <AppProvider>
            <CustomAppShell>
                {children}
            </CustomAppShell>
        </AppProvider>
    )
}

export default MainLayout