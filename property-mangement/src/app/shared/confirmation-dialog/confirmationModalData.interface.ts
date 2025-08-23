export interface confirmationDialogData
{
    title?: string;
    subTitle?:string;
    content?:string;
    message?: string;
    isContent?:Boolean
    type?: | 'success' | 'warn' | 'error' | 'info';
    icon?: {
        show?: boolean;
        class?: string;
        color?:
            | 'error'
            | 'basic'
            | 'info'
            | 'success'
            | 'warn';
    };
    actions?: {
        confirm?: {
            show?: boolean;
            label?: string;
            color?:
                | 'info'
                | 'danger';
        };
        cancel?: {
            show?: boolean;
            label?: string;
        };
    };
}
