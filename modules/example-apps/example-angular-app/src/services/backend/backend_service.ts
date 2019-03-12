import {Injectable} from '@angular/core';
import {BackendService} from '../../../../example-react-app/src/shared/services/backend/backend_service';

@Injectable({ providedIn: 'root' })
export class NgBackendService extends BackendService {}
