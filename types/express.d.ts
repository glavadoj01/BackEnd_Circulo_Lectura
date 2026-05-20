declare global {
  namespace Express {
    export interface Request {
      user?: {
        id_usuario: number;
        esAdministrador: number;
        nombre_usuario: string;
        // lo que necesites
      } | null;
    }
  }
}
