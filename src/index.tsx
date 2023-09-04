import { useRequest } from "ahooks"
import { useRef } from "react"

export type ActionRefType<T = any, P extends any[] = any> = ReturnType<typeof useRequest<T, P>> & {
  setParam: (partialParam: any, index?: number) => void
}

const ModifiedMethods = ['run', 'runAsync', 'mutate', 'refresh', 'refreshAsync']

function createSeed() {
  return Math.random().toString(36).slice(2)
}

function merge(targetList: any[] = [], sourceList: any[] = []) {
  const a = targetList.map((item, index) => {
    if (item && typeof item === 'object') {
      return { ...item, ...sourceList[index] }
    } else {
      return item ?? sourceList[index]
    }
  })
  const b = targetList.length >= sourceList.length ? [] : sourceList.slice(targetList.length)
  return [...a, ...b]
}

function modify(object: ReturnType<typeof useRequest>, seedRef: React.MutableRefObject<string>, params: any[]) {
  ModifiedMethods.forEach(name => {
    //@ts-ignore
    const originMethod = object[name]
    //@ts-ignore
    object[name] = (...args: any[]) => {
      seedRef.current = createSeed()
      return originMethod(...merge(args, params))
    }
  })
}

export default function AsyncRender<T, P extends any[]>(props: {
  actionRef?: React.MutableRefObject<ActionRefType<T, P>>
  request: (...params: P) => Promise<T>
  options?: Parameters<typeof useRequest<T, P>>[1]
  children: (result: ReturnType<typeof useRequest<T, P>>, seed: string) => React.ReactElement
}) {
  const result = useRequest(props.request, props.options)
  const seedRef = useRef('')
  const paramsRef = useRef<any[]>([])

  modify(result, seedRef, paramsRef.current)

  if (props.actionRef) {
    props.actionRef.current = {
      ...result,
      setParam(partialParam, index = 0) {
        if (!paramsRef.current[index]) {
          paramsRef.current[index] = {}
        }
        Object.assign(paramsRef.current[index], partialParam)
      },
    }
  }

  return props.children(result, seedRef.current)
}