export interface ToastrConfigData{
    data : {
        message : string,
        title   ?: string,
        action  ?: string,
        type    ?:
        | 'success'
        | 'error'
        | 'info'
        | 'warn'
    },
    duration    ?: number,
    pannelClass ?: string,
    horizontalPosition ?:
        | 'start' 
        | 'center' 
        | 'end' 
        | 'left' 
        | 'right',
    verticalPosition ?:
        |'top' 
        | 'bottom'
}