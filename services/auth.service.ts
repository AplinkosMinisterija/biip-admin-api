'use strict';

import moleculer, { Context } from 'moleculer';
import { Action, Method, Service } from 'moleculer-decorators';

import authMixin from 'biip-auth-nodejs/mixin'
import { UserAuthMeta } from './api.service';
import { BaseModelInterface } from '../types';

export interface App extends BaseModelInterface {
  name: string;
  type: string;
}

export interface User extends BaseModelInterface {
  firstName: string;
  lastName: string;
}

@Service({
  name: 'auth',
  mixins: [
    authMixin(process.env.AUTH_API_KEY, {
      host: process.env.AUTH_HOST || 'https://auth.biip.lt'
    })
  ],
  hooks: {
    before: {
      'groups.create': 'assignAdminAppIfNeeded',
      'groups.update': 'assignAdminAppIfNeeded',
      'users.create': ['assignAdminAppIfNeeded', 'assignUserTypeIfNeeded'],
      'users.update': 'assignAdminAppIfNeeded',
    },
    after: {
      'groups.create': 'saveMunicipalitiesIfNeeded',
      'groups.update': 'saveMunicipalitiesIfNeeded',
    }
  }
})

export default class AuthService extends moleculer.Service {
  @Action({
    cache: {
      keys: ['#user.id'],
    },
  })
  async me(ctx: Context<{}, UserAuthMeta>) {
    return ctx.meta.user
  }

  @Method
  assignAdminAppIfNeeded(ctx: Context<{apps: Array<any>}, UserAuthMeta>) {
    const {apps} = ctx.params
    const adminAppId = ctx.meta.app.id
    if (!apps || !apps.length || !adminAppId) return ctx

    const hasAdminApp = apps.some(a => a == adminAppId)
    if (hasAdminApp) return ctx

    ctx.params.apps = [...apps, adminAppId]
    return ctx
  }

  @Method
  async saveMunicipalitiesIfNeeded(ctx: Context<{ id: number, municipalities: Array<any> }>, data: any) {
    const {municipalities} = ctx.params

    if (!municipalities || !municipalities.length || !data.id) return data

    await this.broker.call('auth.permissions.createWithMunicipalities', {
      group: data.id,
      municipalities
    }, { meta: ctx.meta })

    return data
  }

  @Method
  async assignUserTypeIfNeeded(ctx: Context<{ type: string }>) {
    const {type} = ctx.params

    if (type && ['ADMIN', 'SUPER_ADMIN'].includes(type)) return ctx

    ctx.params.type = 'ADMIN'

    return ctx
  }
}
