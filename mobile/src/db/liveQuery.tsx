import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

type LiveQueryResult<T> =
  | {
      isLoading: true;
    }
  | {
      isLoading: false;
      result: T;
    };

export function useLiveQuery<T>(query: () => Promise<T>): LiveQueryResult<T> {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<T | null>(null);

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
