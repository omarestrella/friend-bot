type UserData = object & {
  karma: number
  karmaBank: number
}

declare module 'table' {
  export function table (table: any[][], opts?: object)
}
