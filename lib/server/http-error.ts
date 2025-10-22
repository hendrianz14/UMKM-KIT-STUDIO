export class HttpError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "HttpError";
  }
}