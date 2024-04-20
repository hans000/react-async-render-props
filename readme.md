# React Async Render Props

It is a component to build children by resolving a promise with Render Props pattern.

## Usage

```
import AsyncRender, { type ActionType, useActionHandler } from 'react-async-render-props'

function Foo() {
    const actionRef = useActionHandler()
    return (
        <>
            <Button onClick={() => {
                actionRef.current!.runAsync()
            }}>fetch</Button>
            <AsyncRender id='fooId' actionRef={actionRef} request={() => {
                return new Promise<SelectOption[]>(resolve => {
                    setTimeout(() => {
                        resolve([
                            {
                                label: Math.random().toString(36),
                                value: 'xxx'
                            },
                        ])
                    }, 500);
                })
            }}>
                {
                    ({ loading, data, runAsync }) => {
                        return (
                            <Spin spinning={loading}>
                                <Button onClick={() => {
                                    runAsync()
                                }}>fetch</Button>
                                <ProFormSelect options={data}/>
                            </Spin>
                        )
                    }
                }
            </AsyncRender>
        </>
    )
}

export default function App() {
    return (
        <div>
            <div onClick={() => {
                AsyncRender.getHandler('fooId').runAsync()
            }}>clickme</div>
            <Foo />
        </div>
    )
}
```

## API

|Name|Type|Description|
|--|--|--|
|request|`(...params: P) => Promise\<T\>`|Required, A function returning a promise (it will be called when the component is mounted)|
|children|`(result: ReturnType\<typeof useRequest\<T, P\>\>) => React.ReactElement`|Required, A render props function|
|actionRef|`React.MutableRefObject\<ActionType\<T, P\>\>`|get useRequest result|
|options|-|useRequest options|
|id|`string`|mark instance|
|forceUpdate|`boolean`|force update when fired|
|AsyncRender.getHandler|`(id: string) => ActionType`|get action handler|

```
type ActionType<T = any, P extends any[] = any> = ReturnType<typeof useRequest<T, P>> & {
  setParam: (partialParam: any, index?: number) => void
}
```


## License
[MIT](./license)