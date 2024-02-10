import { ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import WrapperBox from './WrapperBox'
import { useForm } from '@mantine/form'
import { INote, db } from '../../db'
import { showNotification } from '@mantine/notifications'
import CustomCopyBtn from './CustomCopyBtn'
import { IconTrash, IconWriting } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { useEffect, useState } from 'react'

interface IQuickNotes {
    color: string
}

interface IAddQuickNote {
    updating: boolean
    data?: any
    id?: any
    color: string
    callBackFn: any
}

const AddQuickNote = (props: IAddQuickNote) => {
    const { updating, data, id, color, callBackFn } = props

    const form = useForm({
        initialValues: {
            title: updating ? data?.title : '',
            note: updating ? data?.note : '',
        },
        validate: {
            title: val => val === '' ? 'Title required!' : null,
            note: val => val === '' ? 'Description required!' : null
        }
    })

    const handleSave = () => {
        if (updating) {
            db.notes.update(Number(id), { note: form.values.note }).then(() => {
                showNotification({
                    message: "Note updated successfully",
                    color: 'green'
                })
                callBackFn && callBackFn()
            }).catch(() => {
                showNotification({
                    message: "Unable to update note!",
                    color: 'red'
                })
            })
        }
        else {
            db.notes.add({ note: form.values.note, title: form.values.title }).then(() => {
                showNotification({
                    message: "Note saved successfully",
                    color: 'green'
                })
                form.reset()
                callBackFn && callBackFn()
            }).catch(() => {
                showNotification({
                    message: "Unable to save note!",
                    color: 'red'
                })
            })
        }
       
    }

    return (
        <form onSubmit={form.onSubmit(_values => handleSave())}>
            <Stack gap={10}>
                <TextInput radius={'md'} placeholder='Title' label="Title" {...form.getInputProps('title')} />
                <TextInput radius={'md'} placeholder='Note' label="Note" {...form.getInputProps('note')} />
                <Group>
                    <Button size='sm' radius={'md'} type='submit' color={color}>
                        {updating ? 'Update' : 'Add'}
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}

const Note = (props: INote & {callBackFn: any}) => {
    const { note, id, title, callBackFn } = props
    const updateNote = () => modals.open({
        title: 'Update Note',
        radius:'md',
        children: (
            <AddQuickNote updating={true} data={{ note: note, title: title }} id={id} color='green' callBackFn={callBackFn} />
        )
    })

    const deleteNote = () => {
        db.notes.delete(Number(id)).then(() => {
            showNotification({
                message: 'Note deleted succesfully',
                color: 'green'
            })
            callBackFn && callBackFn()
        }).catch(() => {
            showNotification({
                message: 'Unable to delete note',
                color: 'red'
            })
        })
    }
    return (
        <Group align='start' wrap='nowrap' justify='space-between' style={{
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
        }} p={'xs'}>
            <Stack gap={0}>
                <Text fw={500}>{title}</Text>
                <Text size='sm'>{note ?? '-'}</Text>
            </Stack>
            <Group gap={2}>
                <CustomCopyBtn color='blue' copy_value={note} />
                <ActionIcon size={'sm'} variant='light' color='orange' onClick={updateNote}>
                    <IconWriting size={'18px'} />
                </ActionIcon>
                <ActionIcon size={'sm'} variant='light' color='red' onClick={deleteNote}>
                    <IconTrash size={'18px'} />
                </ActionIcon>
            </Group>
        </Group>
    )
}

const QuickNotes = (props: IQuickNotes) => {
    const { color } = props
    const [notes, setNotes] = useState<INote[]>([])
    const loadNotes = async() => {
        const _notes = await db.notes.toArray()
        setNotes(_notes)
    }
    useEffect(() => {
        loadNotes()
    }, [])
    return (
        <WrapperBox color={color}>
            <Stack>
                <AddQuickNote updating={false} color={color} callBackFn={loadNotes} />
                {
                    notes?.map((note: INote) => (
                        <Note key={`note_${note.id}`} {...note} callBackFn={loadNotes} />
                    ))
                }
            </Stack>
        </WrapperBox>
    )
}

export default QuickNotes