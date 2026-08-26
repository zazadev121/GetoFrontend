export interface ApiResponse<T = any> {
  statusCode: number;
  message: string | null;
  data: T;
}
