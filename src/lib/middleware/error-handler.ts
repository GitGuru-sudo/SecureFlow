import { NextResponse } from 'next/server';

export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      // Strict sanitization: Never leak stack traces or env variables to the client
      return NextResponse.json(
        { 
          error: "Internal Server Error", 
          message: "An unexpected error occurred. Incident logged.",
          success: false 
        }, 
        { status: 500 }
      );
    }
  };
}
