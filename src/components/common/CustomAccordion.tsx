import { Group, Avatar, Text, Accordion } from '@mantine/core';
import { ReactNode } from 'react';

export interface AccordionItem {
    id: string
    image: string
    label: string
    description: string
    content: ReactNode
}

interface AccordionLabelProps {
    label: string;
    image: string;
    description: string;
}

function AccordionLabel({ label, image, description }: AccordionLabelProps) {
    return (
        <Group wrap="nowrap">
            <Avatar src={image} radius="xl" size="lg" />
            <div>
                <Text fw={500} size='sm'>{label}</Text>
                <Text size="xs" c="dimmed" fw={400}>
                    {description}
                </Text>
            </div>
        </Group>
    );
}

interface ICustomAccordion {
    itemList: AccordionItem[]
    activeItemsIds: string[]
}

function CustomAccordion(props: ICustomAccordion) {
    const { itemList, activeItemsIds } = props

    const items = itemList.map((item) => (
        <Accordion.Item value={item.id} key={item.label} >
            <Accordion.Control>
                <AccordionLabel {...item} />
            </Accordion.Control>
            <Accordion.Panel>
                {item.content}
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <Accordion chevronPosition="right" variant="contained" multiple defaultValue={activeItemsIds} radius={'md'} p={0}>
            {items}
        </Accordion>
    );
}

export default CustomAccordion