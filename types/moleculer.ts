import moleculer, { Context } from 'moleculer';
import { ActionSchema, ActionParamSchema } from 'moleculer';
import { IncomingMessage } from 'http';
import { UserAuthMeta } from '../services/api.service';


export type FieldHookCallback = {
  ctx: Context<null, UserAuthMeta>;
  value: any;
  params: any;
  field: any;
  operation: any;
  entity: any;
};

export interface RouteSchemaOpts {
  path: string;
  whitelist?: string[];
  authorization?: boolean;
  authentication?: boolean;
  aliases?: any;
}

export interface RouteSchema {
  path: string;
  mappingPolicy?: 'restricted' | 'all';
  opts: RouteSchemaOpts;
  middlewares: ((req: any, res: any, next: any) => void)[];
  authorization?: boolean;
  authentication?: boolean;
  logging?: boolean;
  etag?: boolean;
  cors?: any;
  rateLimit?: any;
  whitelist?: string[];
  hasWhitelist: boolean;
  callOptions?: any;
}

export interface RequestMessage extends IncomingMessage {
  $action: ActionSchema;
  $params: ActionParamSchema;
  $route: RouteSchema;
}
