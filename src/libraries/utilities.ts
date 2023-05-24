import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

//- clsx  // je aby jsme mohli pouzivat conditional classNames 
//- tailwind-merge // je aby jsme mohli spojit všechna classes together



export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function chatHrefConstructor (id1:string, id2: string) {
    const sortedIds = [id1,id2].sort()
    return `${sortedIds[0]}--${sortedIds[1]}`
}

//here I'm replacing character : for __ to be able to use pusher
export const toPusherKey = (key:string) => {
    return key.replace(/:/g,'__')
}
// export default toPusherKey