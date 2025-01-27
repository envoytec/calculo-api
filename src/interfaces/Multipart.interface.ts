export interface FileRequestBody {
    filename: string;
    file: NodeJS.ReadableStream;
    fields: any;    
    mimetype: string;
}
