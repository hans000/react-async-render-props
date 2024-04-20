import { useLatest, useMemoizedFn, useRequest } from "ahooks"
import React, { useEffect, useMemo } from "react"
import { useRef } from "react"

type GetPrefixed<T> = `get${Capitalize<string & T>}`

type ToGetMethod<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : GetPrefixed<K>]: T[K] extends (...args: any[]) => any ? T[K] : (() => T[K])
}

export type ActionType<T = any, P extends any[] = any[]> = ToGetMethod<ReturnType<typeof useRequest<T, P>>> & {
  setParam: (partialParam: any, index?: number) => void
}

const ModifiedMethods = ['run', 'runAsync', 'mutate', 'refresh', 'refreshAsync']

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

function modify(object: Record<string, any>, seedRef: React.MutableRefObject<string>, params: any[]) {
  ModifiedMethods.forEach(name => {
    const originMethod = object[name]
    if (originMethod) {
      object[name] = (...args: any[]) => {
        seedRef.current = Math.random().toString(36)
        return originMethod(...merge(args, params))
      }
    }
  })
}

export function useActionHandler(): React.MutableRefObject<ActionType | undefined>
export function useActionHandler<T extends readonly string[]>(nameList: T): Record<T[number], React.MutableRefObject<ActionType | undefined>>
export function useActionHandler(nameList?: string[]): unknown {
  const ref = useRef<unknown>({})
  return nameList === undefined ? (ref.current = undefined, ref) : nameList.reduce((acc, name) => (acc[name] = {}, acc), ref.current as Record<string, unknown>)
}

const cacheMap = new Map<string, ToGetMethod<ActionType>>()

function getHandler(id: string) {
  const handle = cacheMap.get(id)
  if (!handle) {
    throw new ReferenceError(`can not found '${id}' id`)
  }
  return handle
}

function omit<T, Ks extends (keyof T)[]>(obj: T, ...keys: Ks) {
  const result: Record<string, unknown> = {}
  Object.keys(obj as object).forEach((k) => {
    if (!keys.includes(k as keyof T)) {
      result[k] = (obj as any)[k]
    }
  })
  return result as T
}

AsyncRender.getHandler = getHandler

export default function AsyncRender<T, P extends any[]>(props: {
  actionRef?: React.MutableRefObject<ActionType | undefined>
  /** useRequest的service选项 */
  request: (...params: P) => Promise<T>
  /** useRequest的options选项 */
  options?: Parameters<typeof useRequest<T, P>>[1]
  children: (result: ReturnType<typeof useRequest<T, P>>) => React.ReactElement
  /** 强制更新，内部使用一个随机的key触发渲染 */
  forceUpdate?: boolean
  /** 设置了id后会缓存当前实例，需要全局唯一 */
  id?: string
}) {
  const result = useRequest(props.request, props.options)
  const seedRef = useRef('')
  const paramsRef = useRef<any[]>([])
  const memorizedChildren = useMemoizedFn(props.children)
  const resultRef = useLatest(result)

  modify(result, seedRef, paramsRef.current)

  const handle: ActionType = {
    ...omit(resultRef.current, 'data', 'error', 'params'),
    setParam(partialParam, index = 0) {
      if (!paramsRef.current[index]) {
        paramsRef.current[index] = {}
      }
      Object.assign(paramsRef.current[index], partialParam)
    },
    getLoading: () => resultRef.current.loading,
    getParams: () => resultRef.current.params,
    getData: () => resultRef.current.data,
    getError: () => resultRef.current.error,
  }

  if (props.actionRef) {
    props.actionRef.current = handle
  }

  const dom = useMemo(() => memorizedChildren(result), [result])

  useEffect(() => {
    if (props.id) {
      if (cacheMap.has(props.id)) {
        throw new Error(`Warning: ${props.id} has been used.`)
      }
      cacheMap.set(props.id, handle)
      return () => {
        cacheMap.delete(props.id!)
      }
    }
  }, [props.id])

  return (
    <React.Fragment key={props.forceUpdate ? seedRef.current : undefined}>{dom}</React.Fragment>
  )
}