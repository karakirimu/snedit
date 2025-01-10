import { useState } from "react";

export type Property<T> = {
    get: () => T;
    set: React.Dispatch<React.SetStateAction<T>>;
}

/**
 * A custom hook that creates a property with a getter and setter.
 * @param initialValue The initial value of the property.
 * @returns A property object with a getter and setter.
 */
export function useProperty<T = undefined>(initialValue: T | (() => T)) : Property<T> {
    const [v, sV] = useState<T>(initialValue);
    return { get: () => v, set: sV };
}