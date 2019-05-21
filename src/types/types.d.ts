interface UserData {
  karma: number
  karmaBank: number
  frozen: boolean
}

declare module 'table' {
  export function table(table: any[][], opts?: object)
}
