import { useRequest } from "ahooks"

export type ActionRefType<T> = ReturnType<typeof useRequest<T, any>>

export default function AsyncRender<T>(props: {
    actionRef?: React.MutableRefObject<ReturnType<typeof useRequest<T, any>>>
    request: () => Promise<T>
    children: (result: ReturnType<typeof useRequest<T, any>>) => React.ReactElement
}) {
    const result = useRequest(props.request)
    if (props.actionRef) {
        props.actionRef.current = result
    }
    return props.children(result)
}