import { useRef, useCallback, useEffect } from 'react';

/**
 * 自定义 Hook：统一管理 setTimeout，确保组件卸载时自动清理
 *
 * @example
 * function MyComponent() {
 *   const { setTimeout, clearTimeout } = useTimeout();
 *
 *   const start = () => {
 *     setTimeout(() => {
 *       console.log('执行了！');
 *     }, 1000);
 *   };
 *
 *   return <button onClick={start}>开始</button>;
 * }
 */
export function useTimeout() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 设置定时器，自动清除之前的定时器
   */
  const setTimeoutCallback = useCallback((callback: () => void, delay: number) => {
    // 先清除之前的定时器（如果存在）
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current = null; // 执行后清除引用
    }, delay);
  }, []);

  /**
   * 手动清除当前定时器
   */
  const clearTimeoutCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 组件卸载时自动清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    setTimeout: setTimeoutCallback,
    clearTimeout: clearTimeoutCallback,
  };
}

/**
 * 自定义 Hook：管理多个独立的定时器
 * 适用于需要同时运行多个定时器的场景
 *
 * @example
 * function MyComponent() {
 *   const { setTimeout, clearTimeout, clearTimeoutAll } = useTimeoutMap();
 *
 *   const startMultiple = () => {
 *     setTimeout('timer1', () => console.log('Timer 1'), 1000);
 *     setTimeout('timer2', () => console.log('Timer 2'), 2000);
 *   };
 *
 *   return <button onClick={startMultiple}>开始</button>;
 * }
 */
export function useTimeoutMap() {
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /**
   * 设置命名定时器
   */
  const setTimeoutCallback = useCallback((key: string, callback: () => void, delay: number) => {
    // 清除同名定时器（如果存在）
    const existing = timeoutsRef.current.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    // 设置新的定时器
    const timeoutId = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(key); // 执行后删除
    }, delay);

    timeoutsRef.current.set(key, timeoutId);
  }, []);

  /**
   * 清除指定定时器
   */
  const clearTimeoutCallback = useCallback((key: string) => {
    const timeoutId = timeoutsRef.current.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(key);
    }
  }, []);

  /**
   * 清除所有定时器
   */
  const clearTimeoutAllCallback = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  // 组件卸载时自动清理所有定时器
  useEffect(() => {
    return () => {
      clearTimeoutAllCallback();
    };
  }, [clearTimeoutAllCallback]);

  return {
    setTimeout: setTimeoutCallback,
    clearTimeout: clearTimeoutCallback,
    clearTimeoutAll: clearTimeoutAllCallback,
  };
}
