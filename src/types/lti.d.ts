// ============================================================================
// DECLARACIÓN DE TIPOS PARA IMS-LTI
// ============================================================================

declare module 'ims-lti' {
  import { Request } from 'express';

  export class Provider {
    constructor(consumerKey: string, consumerSecret: string);
    
    valid_request(
      req: Request, 
      callback: (err: Error | null, isValid: boolean) => void
    ): void;
  }

  export class OutcomeService {
    constructor(options: any);
    send_replace_result(score: number, callback: (err: Error | null, result: boolean) => void): void;
  }
}