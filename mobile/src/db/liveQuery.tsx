import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

export function useLiveQuery<T>(query: () => Promise<T>):
  | {
      isLoading: true;
    }
  | {
      isLoading: false;
      result: T;
    } {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<T | null>(null);

  useEffect(() => {
    query().then((res) => {
      setResult(res);
      setIsLoading(false);
    });
    // eslint-disable-next-line
  }, [setIsLoading, setResult]);

  useEffect(() => {
    const listener = SQLite.addDatabaseChangeListener(() => {
      query().then((res) => {
        setResult(res);
        setIsLoading(false);
      });
    });

    return () => {
      listener.remove();
    };
  }, [setIsLoading, setResult, query]);

  if (isLoading) {
    return { isLoading: true };
  }

  return {
    isLoading,
    result: result!,
  };
}
