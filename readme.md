# React Async Render Props

It is a component to build children by resolving a promise with Render Props pattern.

## Usage

```
import AsyncRender, { ActionRefType } from 'react-async-render-props'

export default function App() {
    const actionRef = useRef<ActionRefType<SelectOption[]>>()
    return (
        <div>
            <div onClick={() => {
                actionRef.current.run()
            }}>clickme</div>
            <AsyncRender actionRef={actionRef} request={() => {
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
                    ({ loading, data, run }) => {
                        return (
                            <Spin spinning={loading}>
                                <ProFormSelect options={data}/>
                            </Spin>
                        )
                    }
                }
            </AsyncRender>
        </div>
    )
}
```

> you can use **key** prop to re-render component

```
import AsyncRender, { ActionRefType } from 'react-async-render-props'

export default function App() {
    const actionRef = useRef<ActionRefType<SelectOption[]>>()
    return (
        <div>
            <div onClick={() => {
                actionRef.current.setParam({
                    foo: 1,
                })
                actionRef.current.run()
            }}>clickme</div>
            <AsyncRender actionRef={actionRef} request={(params) => Promise.resolve(new Promise<SelectOption[]>(resolve => {
                setTimeout(() => {
                    console.log(params)
                    resolve([
                        {
                            label: Math.random().toString(36),
                            value: 'xxx'
                        },
                    ])
                }, 500);
            }))}>
                {
                    ({ loading, data: request, run }, seed) => {
                        return (
                            <Spin spinning={loading}>
                                <ProFormSelect key={seed} request={request}/>
                            </Spin>
                        )
                    }
                }
            </AsyncRender>
        </div>
    )
}
```
## API

|Name|Type|Description|
|--|--|--|
|request|(...params: P) => Promise\<T\>|Required, A function returning a promise (it will be called when the component is mounted)|
|children|(result: ReturnType\<typeof useRequest\<T, P\>\>, seed: string) => React.ReactElement|Required, A render props function|
|actionRef|React.MutableRefObject\<ActionRefType\<T, P\>\>|get useRequest result|
|options|-|useRequest options|

```
type ActionRefType<T = any, P extends any[] = any> = ReturnType<typeof useRequest<T, P>> & {
  setParam: (partialParam: any, index?: number) => void
}
```


## License
[MIT](./license)