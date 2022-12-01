export class CaudexError {
  code: string;
  name: string;
  details?: any;

  constructor(code: string, name: string, details?: any) {
    this.code = code;
    this.name = name;
    this.details = details;
  }
}
