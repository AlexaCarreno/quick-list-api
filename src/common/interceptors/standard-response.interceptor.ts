import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from './common-interceptor.interface';

@Injectable()
export class StandardResponseInterceptor<T> implements NestInterceptor<
    T,
    ApiResponse<T>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<any> {
        const req = context.switchToHttp().getRequest();

        // Si es OPTIONS, pasa directo sin transformar
        if (req.method === 'OPTIONS') {
            return next.handle();
        }

        return next.handle().pipe(
            map((data: any) => ({
                success: true,
                data,
                error: {},
            })),
        );
    }
}
